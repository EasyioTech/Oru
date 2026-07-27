import { render } from '@react-email/components';
import React from 'react';
import { sendSystemEmail } from './index.js';
import { WelcomeEmail, WelcomeEmailProps } from './templates/welcome.js';
import { PasswordResetEmail, PasswordResetEmailProps } from './templates/password-reset.js';
import { NotificationEmail, NotificationEmailProps } from './templates/notification.js';

export const sendWelcomeEmail = async (to: string, props: WelcomeEmailProps): Promise<void> => {
    const html = await render(React.createElement(WelcomeEmail, props));
    await sendSystemEmail(to, `Welcome to ${props.agencyName}!`, html);
};

export const sendPasswordResetEmail = async (to: string, props: PasswordResetEmailProps): Promise<void> => {
    const html = await render(React.createElement(PasswordResetEmail, props));
    await sendSystemEmail(to, 'Reset your password', html);
};

export const sendNotificationEmail = async (to: string, props: NotificationEmailProps): Promise<void> => {
    const html = await render(React.createElement(NotificationEmail, props));
    await sendSystemEmail(to, props.title, html);
};
