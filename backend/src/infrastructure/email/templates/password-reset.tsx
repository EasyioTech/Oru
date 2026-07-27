import React from 'react';
import { Html, Button, Text, Section, Container, Head, Preview, Body } from '@react-email/components';

export interface PasswordResetEmailProps {
    name: string;
    resetUrl: string;
    expiresInMinutes: number;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ name, resetUrl, expiresInMinutes }) => (
    <Html>
        <Head />
        <Preview>Reset your password</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={section}>
                    <Text style={heading}>Reset your password</Text>
                    <Text style={text}>Hi {name},</Text>
                    <Text style={text}>Someone recently requested a password change for your account. If this was you, you can set a new password here:</Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={resetUrl}>
                            Reset Password
                        </Button>
                    </Section>
                    <Text style={text}>This link will expire in {expiresInMinutes} minutes.</Text>
                    <Text style={text}>If you don't want to change your password or didn't request this, just ignore and delete this message.</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const section = {
    padding: '0 48px',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '400',
    color: '#484848',
    padding: '17px 0 0',
};

const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
};

const buttonContainer = {
    padding: '27px 0 27px',
};

const button = {
    backgroundColor: '#5469d4',
    borderRadius: '3px',
    fontWeight: '600',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
};

export default PasswordResetEmail;
