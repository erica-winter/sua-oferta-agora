# Documentação Técnica Completa - Sistema Dona Oferta

## 1. SISTEMA ATUAL DESENVOLVIDO (Lovable + Supabase)

### 1.1 Frontend React/TypeScript

**Páginas Principais:**
- `/` - Landing page
- `/dashboard` - Dashboard operacional com métricas em tempo real
- `/admin` - Painel administrativo para gestão do sistema

**Componentes Desenvolvidos:**

#### Dashboard (`/dashboard`)
- `RealtimeStats.tsx` - Estatísticas em tempo real (usuários, ofertas, supermercados)
- `WebhookMonitor.tsx` - Monitor de status das Edge Functions
- `RecentActivities.tsx` - Atividades recentes do sistema
- `NotificationCenter.tsx` - Centro de notificações em tempo real

#### Admin (`/admin`)
- `UploadPDF.tsx` - Sistema de upload de PDFs de encartes
- `ReportsCharts.tsx` - Gráficos e relatórios analíticos
- Interface para gestão de supermercados e usuários

### 1.2 Backend Supabase

**Database Schema:**

```sql
-- Tabela de supermercados
CREATE TABLE public.supermercados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  regiao text NOT NULL,
  cep_faixa_inicial integer NOT NULL,
  cep_faixa_final integer NOT NULL,
  url_ofertas text,
  tipo_extracao text NOT NULL, -- 'pdf', 'web', 'api'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de usuários
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone_whatsapp text NOT NULL UNIQUE,
  cep integer NOT NULL,
  cpf text NOT NULL,
  plano text DEFAULT 'trial', -- 'trial', 'premium'
  ativo boolean DEFAULT true,
  data_fim_trial timestamp with time zone DEFAULT (now() + interval '60 days'),
  formato_oferta_preferido text DEFAULT 'Texto', -- 'Texto', 'PDF'
  supermercados_preferidos uuid[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de ofertas
CREATE TABLE public.ofertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supermercado_id uuid NOT NULL,
  nome_produto text NOT NULL,
  preco numeric NOT NULL,
  data_inicio_validade date NOT NULL,
  data_fim_validade date NOT NULL,
  data_extracao timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Tabela de encartes PDF armazenados
CREATE TABLE public.encartes_pdf_armazenados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supermercado_id uuid NOT NULL,
  url_storage text NOT NULL,
  data_encarte date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

**Storage Buckets:**
- `encartes-pdf` (público) - Para armazenamento de PDFs de encartes

### 1.3 Edge Functions Supabase

#### `usuarios-whatsapp`
**Endpoint:** `https://rfrzxobijhrcfixtauft.supabase.co/functions/v1/usuarios-whatsapp`
**Método:** POST
**Função:** Cadastrar novos usuários via WhatsApp

**Payload:**
```json
{
  "telefone": "5511999999999",
  "cep": "01234567",
  "cpf": "12345678901",
  "formato_preferido": "Texto"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso!",
  "usuario": {...},
  "supermercados_disponiveis": [...]
}
```

#### `ofertas-personalizadas`
**Endpoint:** `https://rfrzxobijhrcfixtauft.supabase.co/functions/v1/ofertas-personalizadas`
**Método:** POST
**Função:** Buscar ofertas personalizadas para um usuário

**Payload:**
```json
{
  "telefone": "5511999999999"
}
```

**Response (Texto):**
```json
{
  "success": true,
  "message": "🛒 SUPERMERCADO EXTRA\n📍 Região: Centro\n\n🥖 Pão de Açúcar - R$ 2,50\n⏰ Válido até: 15/01/2025\n\n🥛 Leite Integral - R$ 4,80\n⏰ Válido até: 20/01/2025",
  "total_ofertas": 25
}
```

**Response (PDF):**
```json
{
  "success": true,
  "encartes": [
    {
      "supermercado": "Extra",
      "url_pdf": "https://storage-url/encarte.pdf",
      "data_encarte": "2025-01-07"
    }
  ],
  "total_ofertas": 150
}
```

#### `processar-ofertas`
**Endpoint:** `https://rfrzxobijhrcfixtauft.supabase.co/functions/v1/processar-ofertas`
**Método:** POST
**Função:** Processar e armazenar ofertas extraídas

**Payload:**
```json
{
  "supermercado_id": "uuid-do-supermercado",
  "ofertas_extraidas": [
    {
      "nome_produto": "Pão de Açúcar",
      "preco": "2.50",
      "data_inicio_validade": "2025-01-07",
      "data_fim_validade": "2025-01-15"
    }
  ],
  "url_pdf": "https://supermercado.com/encarte.pdf" // opcional
}
```

### 1.4 Workflows N8N Desenvolvidos

**Arquivo:** `n8n-workflows/dona-oferta-workflows.json`

#### Workflow 1: Cadastro de Usuários WhatsApp
- **Trigger:** Webhook `/cadastro-usuario`
- **Fluxo:** Recebe dados → Processa → Chama Edge Function → Envia confirmação WhatsApp
- **Integração:** WhatsApp Business API

#### Workflow 2: Envio de Ofertas Personalizadas
- **Trigger:** Cron (8h e 18h diariamente)
- **Fluxo:** Busca usuários ativos → Para cada usuário busca ofertas → Envia via WhatsApp
- **Integração:** WhatsApp Business API + Edge Functions

#### Workflow 3: Processamento de Ofertas
- **Trigger:** Webhook `/processar-ofertas`
- **Fluxo:** Recebe ofertas extraídas → Processa via Edge Function → Retorna status
- **Integração:** Sistema Python de extração

#### Workflow 4: WhatsApp Interativo
- **Trigger:** Webhook mensagens WhatsApp
- **Fluxo:** Processa comando → Busca ofertas → Responde usuário
- **Integração:** WhatsApp Business API

---

## 2. ESPECIFICAÇÕES PARA DESENVOLVIMENTO PYTHON

### 2.1 Arquitetura do Sistema Python

**Estrutura de Diretórios Requerida:**
```
dona-oferta-python/
├── main.py                 # Aplicação principal
├── requirements.txt        # Dependências
├── config/
│   ├── settings.py        # Configurações gerais
│   └── database.py        # Configurações de banco
├── extractors/
│   ├── __init__.py
│   ├── base_extractor.py  # Classe base para extratores
│   ├── pdf_extractor.py   # Extrator de PDFs
│   ├── web_extractor.py   # Extrator de sites
│   └── api_extractor.py   # Extrator de APIs
├── processors/
│   ├── __init__.py
│   ├── offer_processor.py # Processador de ofertas
│   └── image_processor.py # Processador de imagens
├── integrations/
│   ├── __init__.py
│   ├── n8n_client.py     # Cliente para N8N
│   ├── supabase_client.py # Cliente para Supabase
│   └── whatsapp_client.py # Cliente para WhatsApp
├── models/
│   ├── __init__.py
│   ├── supermercado.py   # Modelo Supermercado
│   ├── oferta.py         # Modelo Oferta
│   └── usuario.py        # Modelo Usuario
├── services/
│   ├── __init__.py
│   ├── extraction_service.py
│   └── notification_service.py
├── utils/
│   ├── __init__.py
│   ├── logger.py         # Sistema de logs
│   └── validators.py     # Validadores
└── tests/
    ├── __init__.py
    └── test_extractors.py
```

### 2.2 Dependências Python Requeridas

**requirements.txt:**
```txt
fastapi==0.104.1
uvicorn==0.24.0
requests==2.31.0
beautifulsoup4==4.12.2
PyPDF2==3.0.1
pdfplumber==0.10.3
selenium==4.15.0
pandas==2.1.3
numpy==1.25.2
Pillow==10.1.0
opencv-python==4.8.1.78
pytesseract==0.3.10
supabase==2.0.2
python-multipart==0.0.6
schedule==1.2.0
aiofiles==23.2.1
python-dotenv==1.0.0
pydantic==2.5.0
httpx==0.25.2
lxml==4.9.3
```

### 2.3 Classe Base Extractor

```python
# extractors/base_extractor.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime

class BaseExtractor(ABC):
    """Classe base para todos os extratores de ofertas"""
    
    def __init__(self, supermercado_id: str):
        self.supermercado_id = supermercado_id
        self.data_extracao = datetime.now()
    
    @abstractmethod
    def extract_offers(self, source: str) -> List[Dict[str, Any]]:
        """
        Extrai ofertas da fonte especificada
        
        Args:
            source: URL do site, caminho do PDF ou endpoint da API
            
        Returns:
            Lista de ofertas no formato:
            [
                {
                    "nome_produto": str,
                    "preco": float,
                    "data_inicio_validade": str (YYYY-MM-DD),
                    "data_fim_validade": str (YYYY-MM-DD),
                    "descricao": str (opcional),
                    "categoria": str (opcional),
                    "imagem_url": str (opcional)
                }
            ]
        """
        pass
    
    @abstractmethod
    def validate_source(self, source: str) -> bool:
        """Valida se a fonte é acessível e válida"""
        pass
    
    def clean_price(self, price_text: str) -> float:
        """Limpa e converte texto de preço para float"""
        import re
        # Remove caracteres não numéricos exceto vírgula e ponto
        cleaned = re.sub(r'[^\d,.]', '', price_text)
        # Substitui vírgula por ponto
        cleaned = cleaned.replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
    
    def parse_date(self, date_text: str) -> str:
        """Converte texto de data para formato YYYY-MM-DD"""
        import re
        from datetime import datetime
        
        # Padrões de data brasileiro: DD/MM/YYYY, DD-MM-YYYY
        patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_text)
            if match:
                day, month, year = match.groups()
                if len(year) == 2:
                    year = '20' + year
                try:
                    date_obj = datetime(int(year), int(month), int(day))
                    return date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    continue
        
        # Se não conseguir parsear, retorna data de hoje + 7 dias
        from datetime import timedelta
        return (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
```

### 2.4 Extrator de PDF

```python
# extractors/pdf_extractor.py
import PyPDF2
import pdfplumber
import requests
from typing import List, Dict, Any
from .base_extractor import BaseExtractor

class PDFExtractor(BaseExtractor):
    """Extrator especializado para PDFs de encartes"""
    
    def extract_offers(self, pdf_url: str) -> List[Dict[str, Any]]:
        """
        Extrai ofertas de PDF de encarte
        
        Deve implementar:
        1. Download do PDF da URL
        2. Extração de texto com pdfplumber
        3. OCR com pytesseract se necessário
        4. Parsing de produtos, preços e datas
        5. Limpeza e normalização dos dados
        """
        offers = []
        
        try:
            # Download do PDF
            response = requests.get(pdf_url)
            with open('temp_encarte.pdf', 'wb') as f:
                f.write(response.content)
            
            # Extração com pdfplumber
            with pdfplumber.open('temp_encarte.pdf') as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        # Parse do texto extraído
                        page_offers = self._parse_pdf_text(text)
                        offers.extend(page_offers)
            
            # Se não extraiu texto, usar OCR
            if not offers:
                offers = self._extract_with_ocr('temp_encarte.pdf')
                
        except Exception as e:
            print(f"Erro na extração PDF: {e}")
            
        return offers
    
    def _parse_pdf_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Parse do texto extraído do PDF
        Deve implementar lógica específica para identificar:
        - Nomes de produtos
        - Preços (padrões como R$ X,XX, X,XX, etc.)
        - Datas de validade
        """
        import re
        offers = []
        
        # Padrões regex para identificar ofertas
        price_pattern = r'R\$\s*(\d+[.,]\d{2})'
        product_pattern = r'([A-ZÁÊÃÇÕ][a-záêãçõ\s]+(?:[A-ZÁÊÃÇÕ][a-záêãçõ\s]*)*)'
        
        # Implementar lógica de parsing específica
        # Esta é uma implementação simplificada
        lines = text.split('\n')
        for line in lines:
            price_match = re.search(price_pattern, line)
            if price_match:
                price = self.clean_price(price_match.group(1))
                # Tentar encontrar produto na mesma linha ou linhas próximas
                product_match = re.search(product_pattern, line)
                if product_match:
                    offers.append({
                        "nome_produto": product_match.group(1).strip(),
                        "preco": price,
                        "data_inicio_validade": self.data_extracao.strftime('%Y-%m-%d'),
                        "data_fim_validade": self.parse_date("31/12/2025")  # Default
                    })
        
        return offers
    
    def _extract_with_ocr(self, pdf_path: str) -> List[Dict[str, Any]]:
        """Extração usando OCR com pytesseract"""
        import pytesseract
        from pdf2image import convert_from_path
        
        offers = []
        
        try:
            # Converter PDF para imagens
            images = convert_from_path(pdf_path)
            
            for image in images:
                # OCR da imagem
                text = pytesseract.image_to_string(image, lang='por')
                page_offers = self._parse_pdf_text(text)
                offers.extend(page_offers)
                
        except Exception as e:
            print(f"Erro no OCR: {e}")
            
        return offers
    
    def validate_source(self, pdf_url: str) -> bool:
        """Valida se o PDF é acessível"""
        try:
            response = requests.head(pdf_url)
            return response.status_code == 200 and 'pdf' in response.headers.get('content-type', '')
        except:
            return False
```

### 2.5 Extrator Web

```python
# extractors/web_extractor.py
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from typing import List, Dict, Any
from .base_extractor import BaseExtractor

class WebExtractor(BaseExtractor):
    """Extrator para sites de supermercados"""
    
    def __init__(self, supermercado_id: str, use_selenium: bool = False):
        super().__init__(supermercado_id)
        self.use_selenium = use_selenium
        
    def extract_offers(self, url: str) -> List[Dict[str, Any]]:
        """Extrai ofertas de site web"""
        if self.use_selenium:
            return self._extract_with_selenium(url)
        else:
            return self._extract_with_requests(url)
    
    def _extract_with_requests(self, url: str) -> List[Dict[str, Any]]:
        """Extração usando requests + BeautifulSoup"""
        offers = []
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Implementar seletores específicos por supermercado
            offers = self._parse_website_content(soup)
            
        except Exception as e:
            print(f"Erro na extração web: {e}")
            
        return offers
    
    def _extract_with_selenium(self, url: str) -> List[Dict[str, Any]]:
        """Extração usando Selenium para sites com JavaScript"""
        offers = []
        
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get(url)
            
            # Aguardar carregamento
            driver.implicitly_wait(10)
            
            # Extrair HTML após JavaScript
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            offers = self._parse_website_content(soup)
            
            driver.quit()
            
        except Exception as e:
            print(f"Erro na extração Selenium: {e}")
            
        return offers
    
    def _parse_website_content(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """
        Parse do conteúdo HTML
        Deve implementar seletores específicos para cada rede de supermercado
        """
        offers = []
        
        # Seletores genéricos - devem ser customizados por supermercado
        product_selectors = [
            '.product-name',
            '.item-title',
            'h3.product',
            '[data-product-name]'
        ]
        
        price_selectors = [
            '.price',
            '.product-price', 
            '.valor',
            '[data-price]'
        ]
        
        # Implementar lógica de parsing específica
        # Esta é uma implementação simplificada
        for selector in product_selectors:
            products = soup.select(selector)
            for product in products:
                product_name = product.get_text().strip()
                
                # Buscar preço próximo
                price_element = product.find_next(class_=lambda x: x and 'price' in x.lower())
                if price_element:
                    price_text = price_element.get_text()
                    price = self.clean_price(price_text)
                    
                    if price > 0:
                        offers.append({
                            "nome_produto": product_name,
                            "preco": price,
                            "data_inicio_validade": self.data_extracao.strftime('%Y-%m-%d'),
                            "data_fim_validade": self.parse_date("31/12/2025")
                        })
        
        return offers
    
    def validate_source(self, url: str) -> bool:
        """Valida se o site está acessível"""
        try:
            response = requests.head(url)
            return response.status_code == 200
        except:
            return False
```

### 2.6 Cliente Supabase

```python
# integrations/supabase_client.py
from supabase import create_client, Client
import os
from typing import List, Dict, Any

class SupabaseClient:
    """Cliente para integração com Supabase"""
    
    def __init__(self):
        url = os.getenv('SUPABASE_URL', 'https://rfrzxobijhrcfixtauft.supabase.co')
        key = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
        self.client: Client = create_client(url, key)
    
    def get_supermercados_ativos(self) -> List[Dict]:
        """Busca todos os supermercados ativos"""
        try:
            response = self.client.table('supermercados').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Erro ao buscar supermercados: {e}")
            return []
    
    def get_supermercado(self, supermercado_id: str) -> Dict:
        """Busca um supermercado específico"""
        try:
            response = self.client.table('supermercados').select('*').eq('id', supermercado_id).single().execute()
            return response.data
        except Exception as e:
            print(f"Erro ao buscar supermercado: {e}")
            return {}
    
    def delete_old_offers(self, supermercado_id: str, days: int = 7) -> bool:
        """Remove ofertas antigas de um supermercado"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            self.client.table('ofertas')\
                .delete()\
                .eq('supermercado_id', supermercado_id)\
                .lt('created_at', cutoff_date)\
                .execute()
            return True
        except Exception as e:
            print(f"Erro ao deletar ofertas antigas: {e}")
            return False
    
    def insert_offers(self, offers: List[Dict], supermercado_id: str) -> bool:
        """Insere novas ofertas no banco"""
        try:
            # Adicionar supermercado_id em cada oferta
            for offer in offers:
                offer['supermercado_id'] = supermercado_id
            
            response = self.client.table('ofertas').insert(offers).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao inserir ofertas: {e}")
            return False
    
    def save_pdf_encarte(self, supermercado_id: str, pdf_url: str, data_encarte: str) -> bool:
        """Salva URL do encarte PDF"""
        try:
            data = {
                'supermercado_id': supermercado_id,
                'url_storage': pdf_url,
                'data_encarte': data_encarte
            }
            response = self.client.table('encartes_pdf_armazenados').insert(data).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Erro ao salvar encarte PDF: {e}")
            return False
```

### 2.7 Cliente N8N

```python
# integrations/n8n_client.py
import requests
from typing import Dict, Any, List

class N8NClient:
    """Cliente para comunicação com N8N"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
    
    def trigger_processar_ofertas(self, supermercado_id: str, ofertas: List[Dict], url_pdf: str = None) -> Dict:
        """Dispara webhook de processamento de ofertas no N8N"""
        url = f"{self.base_url}/webhook/processar-ofertas"
        
        payload = {
            "supermercado_id": supermercado_id,
            "ofertas_extraidas": ofertas,
            "timestamp": datetime.now().isoformat()
        }
        
        if url_pdf:
            payload["url_pdf"] = url_pdf
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            return {
                "success": response.status_code == 200,
                "data": response.json() if response.status_code == 200 else None,
                "error": None if response.status_code == 200 else f"HTTP {response.status_code}"
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "error": str(e)
            }
    
    def notify_extraction_complete(self, supermercado_id: str, total_ofertas: int, status: str) -> bool:
        """Notifica N8N sobre conclusão da extração"""
        url = f"{self.base_url}/webhook/extracao-concluida"
        
        payload = {
            "supermercado_id": supermercado_id,
            "total_ofertas": total_ofertas,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            return response.status_code == 200
        except:
            return False
```

### 2.8 Serviço de Extração Principal

```python
# services/extraction_service.py
import schedule
import time
from datetime import datetime
from typing import List, Dict
from extractors.pdf_extractor import PDFExtractor
from extractors.web_extractor import WebExtractor
from extractors.api_extractor import APIExtractor
from integrations.supabase_client import SupabaseClient
from integrations.n8n_client import N8NClient

class ExtractionService:
    """Serviço principal de extração de ofertas"""
    
    def __init__(self, n8n_url: str):
        self.supabase = SupabaseClient()
        self.n8n = N8NClient(n8n_url)
        self.extractors = {
            'pdf': PDFExtractor,
            'web': WebExtractor,
            'api': APIExtractor
        }
    
    def run_extraction_cycle(self):
        """Executa um ciclo completo de extração para todos os supermercados"""
        print(f"Iniciando ciclo de extração - {datetime.now()}")
        
        supermercados = self.supabase.get_supermercados_ativos()
        
        for supermercado in supermercados:
            try:
                self.extract_supermercado_offers(supermercado)
            except Exception as e:
                print(f"Erro na extração do supermercado {supermercado['nome']}: {e}")
    
    def extract_supermercado_offers(self, supermercado: Dict):
        """Extrai ofertas de um supermercado específico"""
        supermercado_id = supermercado['id']
        tipo_extracao = supermercado['tipo_extracao']
        url_ofertas = supermercado['url_ofertas']
        
        print(f"Extraindo ofertas de {supermercado['nome']} ({tipo_extracao})")
        
        # Escolher extrator apropriado
        extractor_class = self.extractors.get(tipo_extracao)
        if not extractor_class:
            print(f"Tipo de extração não suportado: {tipo_extracao}")
            return
        
        extractor = extractor_class(supermercado_id)
        
        # Validar fonte
        if not extractor.validate_source(url_ofertas):
            print(f"Fonte inválida para {supermercado['nome']}: {url_ofertas}")
            return
        
        # Extrair ofertas
        ofertas = extractor.extract_offers(url_ofertas)
        
        if not ofertas:
            print(f"Nenhuma oferta extraída de {supermercado['nome']}")
            return
        
        print(f"Extraídas {len(ofertas)} ofertas de {supermercado['nome']}")
        
        # Enviar para N8N para processamento
        result = self.n8n.trigger_processar_ofertas(
            supermercado_id, 
            ofertas, 
            url_ofertas if tipo_extracao == 'pdf' else None
        )
        
        if result['success']:
            print(f"Ofertas enviadas para processamento via N8N")
        else:
            print(f"Erro ao enviar ofertas para N8N: {result['error']}")
    
    def schedule_extractions(self):
        """Agenda execuções automáticas"""
        # Executar a cada 6 horas
        schedule.every(6).hours.do(self.run_extraction_cycle)
        
        # Executar diariamente às 6h
        schedule.every().day.at("06:00").do(self.run_extraction_cycle)
        
        print("Agendamentos configurados:")
        print("- A cada 6 horas")
        print("- Diariamente às 6h")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar a cada minuto
```

### 2.9 Aplicação Principal

```python
# main.py
import os
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from services.extraction_service import ExtractionService
from integrations.supabase_client import SupabaseClient
import threading

app = FastAPI(title="Dona Oferta - Sistema de Extração", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações
N8N_URL = os.getenv('N8N_URL', 'http://localhost:5678')
extraction_service = ExtractionService(N8N_URL)

@app.on_event("startup")
async def startup_event():
    """Inicia serviços em background"""
    # Executar agendamentos em thread separada
    scheduler_thread = threading.Thread(target=extraction_service.schedule_extractions)
    scheduler_thread.daemon = True
    scheduler_thread.start()

@app.get("/")
async def root():
    return {"message": "Dona Oferta - Sistema de Extração v1.0.0"}

@app.get("/health")
async def health_check():
    """Endpoint de health check"""
    try:
        supabase = SupabaseClient()
        supermercados = supabase.get_supermercados_ativos()
        return {
            "status": "healthy",
            "supermercados_ativos": len(supermercados),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/extract/manual")
async def manual_extraction(background_tasks: BackgroundTasks):
    """Dispara extração manual"""
    background_tasks.add_task(extraction_service.run_extraction_cycle)
    return {"message": "Extração manual iniciada"}

@app.post("/extract/supermercado/{supermercado_id}")
async def extract_specific_supermercado(supermercado_id: str, background_tasks: BackgroundTasks):
    """Extrai ofertas de um supermercado específico"""
    supabase = SupabaseClient()
    supermercado = supabase.get_supermercado(supermercado_id)
    
    if not supermercado:
        return {"error": "Supermercado não encontrado"}
    
    background_tasks.add_task(extraction_service.extract_supermercado_offers, supermercado)
    return {"message": f"Extração iniciada para {supermercado['nome']}"}

@app.get("/status/extractions")
async def extraction_status():
    """Status das extrações"""
    supabase = SupabaseClient()
    supermercados = supabase.get_supermercados_ativos()
    
    status = []
    for supermercado in supermercados:
        # Buscar última extração
        last_offers = supabase.client.table('ofertas')\
            .select('created_at')\
            .eq('supermercado_id', supermercado['id'])\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        last_extraction = None
        if last_offers.data:
            last_extraction = last_offers.data[0]['created_at']
        
        status.append({
            "supermercado": supermercado['nome'],
            "tipo_extracao": supermercado['tipo_extracao'],
            "url_ofertas": supermercado['url_ofertas'],
            "ultima_extracao": last_extraction
        })
    
    return {"extractions": status}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2.10 Configurações de Deploy

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  dona-oferta-python:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=https://rfrzxobijhrcfixtauft.supabase.co
      - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      - N8N_URL=http://n8n:5678
    depends_on:
      - n8n
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=n8n-db
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - n8n-db
    restart: unless-stopped

  n8n-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n
    volumes:
      - n8n_db_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  n8n_data:
  n8n_db_data:
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por \
    poppler-utils \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

### 2.11 Instruções de Deploy

**Variáveis de Ambiente Requeridas:**
```bash
SUPABASE_URL=https://rfrzxobijhrcfixtauft.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
N8N_URL=http://localhost:5678
```

**Comandos de Deploy:**
```bash
# 1. Clonar repositório
git clone <repo-python-dona-oferta>
cd dona-oferta-python

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as configurações corretas

# 3. Executar com Docker Compose
docker-compose up -d

# 4. Importar workflows N8N
# Acessar http://localhost:5678
# Importar arquivo n8n-workflows/dona-oferta-workflows.json

# 5. Configurar WhatsApp Business API no N8N

# 6. Testar sistema
curl http://localhost:8000/health
```

---

## 3. INTEGRAÇÃO COMPLETA

### 3.1 Fluxo de Dados

1. **Sistema Python** extrai ofertas dos supermercados
2. **Python** envia dados para **N8N** via webhook
3. **N8N** processa e envia para **Edge Functions Supabase**
4. **Edge Functions** armazenam no banco de dados
5. **N8N** envia ofertas personalizadas via **WhatsApp**
6. **Frontend React** monitora e administra todo o sistema

### 3.2 Monitoramento

- **Frontend Dashboard**: Métricas em tempo real
- **API Python**: Endpoints de status e health check
- **Logs Centralizados**: Python + N8N + Supabase
- **Alertas**: Falhas de extração e processamento

### 3.3 Escalabilidade

- **Horizontal**: Múltiplas instâncias Python com load balancer
- **Vertical**: Recursos dedicados para OCR e processamento de PDFs
- **Cache**: Redis para cache de ofertas e resultados
- **Queue**: Celery para processamento assíncrono de grandes volumes

---

## 4. ENTREGÁVEIS COMPLETOS

✅ **Frontend React/TypeScript** com Dashboard e Admin  
✅ **3 Edge Functions Supabase** funcionais  
✅ **4 Workflows N8N** completos para importação  
✅ **Especificações Python** detalhadas para implementação  
✅ **Arquitetura de integração** documentada  
✅ **Configurações de deploy** Docker + Docker Compose  

**Sistema pronto para deploy completo com integração Python + N8N + Supabase + React.**