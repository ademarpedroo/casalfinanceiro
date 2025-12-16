import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PartnerInviteEmailProps {
  inviterName: string
  inviterEmail: string
  inviteLink: string
}

export default function PartnerInviteEmail({
  inviterName = 'Seu parceiro(a)',
  inviterEmail = 'parceiro@email.com',
  inviteLink = 'https://casaldev.com.br',
}: PartnerInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} quer compartilhar as financas com voce no CasalFinanceiro!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header com gradiente */}
          <Section style={header}>
            <div style={logoContainer}>
              <span style={heartIcon}>💜</span>
              <Text style={logoText}>CasalFinanceiro</Text>
            </div>
          </Section>

          {/* Conteudo principal */}
          <Section style={content}>
            <Heading style={heading}>
              Voce foi convidado(a)! 🎉
            </Heading>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> ({inviterEmail}) quer compartilhar o controle financeiro com voce no CasalFinanceiro.
            </Text>

            <Text style={paragraph}>
              Com a parceria, voces poderao:
            </Text>

            <Section style={featureList}>
              <Text style={featureItem}>✅ Ver receitas e despesas um do outro</Text>
              <Text style={featureItem}>✅ Gerenciar cartoes de credito juntos</Text>
              <Text style={featureItem}>✅ Acompanhar orcamentos em conjunto</Text>
              <Text style={featureItem}>✅ Ter visao completa das financas do casal</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteLink}>
                Aceitar Convite
              </Button>
            </Section>

            <Text style={smallText}>
              Ou copie e cole este link no navegador:
            </Text>
            <Text style={linkText}>
              <Link href={inviteLink} style={link}>
                {inviteLink}
              </Link>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email foi enviado porque {inviterEmail} convidou voce para o CasalFinanceiro.
            </Text>
            <Text style={footerText}>
              Se voce nao conhece essa pessoa, pode ignorar este email.
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
  backgroundColor: '#6366f1',
  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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

const heartIcon = {
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
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const paragraph = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const featureList = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '16px 0 24px',
}

const featureItem = {
  color: '#3f3f46',
  fontSize: '14px',
  lineHeight: '28px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 24px',
}

const button = {
  backgroundColor: '#6366f1',
  backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 32px',
}

const smallText = {
  color: '#71717a',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const linkText = {
  textAlign: 'center' as const,
  margin: '0',
}

const link = {
  color: '#6366f1',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
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
