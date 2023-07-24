/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../../components/cards';
import { Settings } from '../../../../components/layouts/Settings';
import { Field } from '../components';
import { useTitle } from '$app/common/hooks/useTitle';

export function Clients() {
  useTitle('custom_fields');
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('custom_fields'), href: '/settings/custom_fields' },
    { name: t('clients'), href: '/settings/custom_fields/clients' },
  ];

  return (
    <Settings
      title={t('custom_fields')}
      breadcrumbs={pages}
      docsLink="en/advanced-settings/#custom_fields"
    >
      <CustomFieldsPlanAlert />

      <Card title={`${t('custom_fields')}: ${t('clients')}`}>
        {['client1', 'client2', 'client3', 'client4'].map((field) => (
          <Field key={field} field={field} placeholder={t('client_field')} />
        ))}
      </Card>

      <Card title={`${t('custom_fields')}: ${t('contacts')}`}>
        {['contact1', 'contact2', 'contact3', 'contact4'].map((field) => (
          <Field key={field} field={field} placeholder={t('contact_field')} />
        ))}
      </Card>
    </Settings>
  );
}
