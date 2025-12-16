import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface DueItem {
  description: string
  amount: number
  dueDate: string
  type: 'expense' | 'card'
  cardName?: string
}

interface DueReminderEmailProps {
  userName: string
  items: DueItem[]
  totalAmount: number
  dashboardLink: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default function DueReminderEmail({
  userName = 'Usuario',
  items = [
    { description: 'Conta de luz', amount: 150, dueDate: '15/01', type: 'expense' },
    { description: 'Netflix', amount: 55.9, dueDate: '15/01', type: 'card', cardName: 'Nubank' },
  ],
  totalAmount = 205.9,
  dashboardLink = 'https://casaldev.com.br',
}: DueReminderEmailProps) {
  const itemCount = items.length

  return (
    <Html>
      <Head />
      <Preview>
        Voce tem {itemCount} {itemCount === 1 ? 'conta vencendo' : 'contas vencendo'} em breve - Total: {formatCurrency(totalAmount)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={logoContainer}>
              <span style={bellIcon}>🔔</span>
              <Text style={logoText}>CasalFinanceiro</Text>
            </div>
          </Section>

          {/* Conteudo principal */}
          <Section style={content}>
            <Heading style={heading}>
              Ola, {userName}! 👋
            </Heading>

            <Text style={paragraph}>
              Voce tem <strong>{itemCount} {itemCount === 1 ? 'conta' : 'contas'}</strong> vencendo nos proximos dias:
            </Text>

            {/* Lista de itens */}
            <Section style={itemsContainer}>
              {items.map((item, index) => (
                <div key={index} style={itemRow}>
                  <div style={itemLeft}>
                    <span style={itemIcon}>
                      {item.type === 'card' ? '💳' : '📄'}
                    </span>
                    <div>
                      <Text style={itemDescription}>{item.description}</Text>
                      <Text style={itemMeta}>
                        {item.type === 'card' ? `${item.cardName} • ` : ''}
                        Vence em {item.dueDate}
                      </Text>
                    </div>
                  </div>
                  <Text style={itemAmount}>{formatCurrency(item.amount)}</Text>
                </div>
              ))}
            </Section>

            {/* Total */}
            <Section style={totalContainer}>
              <div style={totalRow}>
                <Text style={totalLabel}>Total a pagar:</Text>
                <Text style={totalValue}>{formatCurrency(totalAmount)}</Text>
              </div>
            </Section>

            {/* Botao */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardLink}>
                Ver no Dashboard
              </Button>
            </Section>

            <Text style={tipText}>
              💡 <strong>Dica:</strong> Marque as contas como pagas no app para manter seu controle atualizado!
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este lembrete foi enviado automaticamente pelo CasalFinanceiro.
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} CasalFinanceiro - Gestao financeira a dois
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Estilos
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '560px',
}

const header = {
  backgroundColor: '#f59e0b',
  backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  borderRadius: '12px 12px 0 0',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const bellIcon = {
  fontSize: '32px',
}

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
}

const heading = {
  color: '#18181b',
  fontSize: '22px',
  fontWeight: 'bold',
  textAlign: 'left' as const,
  margin: '0 0 16px',
}

const paragraph = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const itemsContainer = {
  backgroundColor: '#fafafa',
  borderRadius: '8px',
  padding: '8px',
  margin: '0 0 16px',
}

const itemRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  borderBottom: '1px solid #e4e4e7',
}

const itemLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const itemIcon = {
  fontSize: '24px',
}

const itemDescription = {
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const itemMeta = {
  color: '#71717a',
  fontSize: '12px',
  margin: '0',
}

const itemAmount = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const totalContainer = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 24px',
}

const totalRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const totalLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const totalValue = {
  color: '#b45309',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const button = {
  backgroundColor: '#f59e0b',
  backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
}

const tipText = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  color: '#1e40af',
  fontSize: '13px',
  lineHeight: '20px',
  padding: '12px 16px',
  margin: '0',
}

const hr = {
  borderColor: '#e4e4e7',
  margin: '0',
}

const footer = {
  backgroundColor: '#fafafa',
  borderRadius: '0 0 12px 12px',
  padding: '24px',
}

const footerText = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const footerCopyright = {
  color: '#a1a1aa',
  fontSize: '11px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}
