# CasalFinanceiro

Sistema financeiro completo para gestão de contas de casal.

## Funcionalidades

- **Contas Fixas (Expenses):** Cadastro de boletos e contas de consumo (Água, Luz, Internet).
- **Receitas (Incomes):** Registro de salários e rendas extras.
- **Cartão de Crédito Inteligente:**
  - Cadastro de múltiplos cartões com Dia de Fechamento e Vencimento.
  - **Lançamento de Compras Parceladas:** O sistema calcula automaticamente as parcelas e suas datas de vencimento, respeitando o "Melhor Dia de Compra".
    - Se a compra for feita antes do fechamento, entra na fatura atual.
    - Se for feita depois, joga para a próxima.
    - Vencimento calculado com base na configuração do cartão.
- **Dashboard:**
  - Visão das contas a pagar (não pagas).
  - Lista de próximas parcelas de cartão a vencer.
  - Botão para "Marcar como Pago".

## Como Rodar

1.  Instale as dependências (já instaladas):
    ```bash
    npm install
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  Acesse `http://localhost:3000` (ou a porta indicada no terminal).

## Tecnologias

- **Next.js 16** (App Router & Server Actions)
- **Prisma ORM** (SQLite Database)
- **Tailwind CSS** (Estilização)
- **date-fns** (Cálculos de data precisos)