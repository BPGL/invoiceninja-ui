/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { date } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useResolveLanguage } from '$app/common/hooks/useResolveLanguage';
import { Client } from '$app/common/interfaces/client';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { EntityStatus } from '$app/components/EntityStatus';
import { Inline } from '$app/components/Inline';
import { Tooltip } from '$app/components/Tooltip';
import { DataTableColumnsExtended } from '$app/pages/invoices/common/hooks/useInvoiceColumns';
import { useCallback } from 'react';
import { ExternalLink } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';

export const defaultColumns: string[] = [
  'name',
  'contact_email',
  'id_number',
  'balance',
  'paid_to_date',
  'created_at',
  'last_login_at',
  'website',
];

export function useAllClientColumns() {
  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'client',
    });

  const clientColumns = [
    'number',
    'name',
    'balance',
    'paid_to_date',
    'contact_name',
    'contact_email',
    'last_login_at',
    'address2',
    'archived_at',
    //   'assigned_to',
    'contact_phone',
    'contacts',
    'country',
    'created_at',
    //   'created_by',
    'credit_balance',
    'currency',
    firstCustom,
    secondCustom,
    thirdCustom,
    fourthCustom,
    'documents',
    'entity_state',
    //   'group',
    'id_number',
    'is_deleted',
    'language',
    'phone',
    'private_notes',
    'public_notes',
    'state',
    'address1',
    'task_rate',
    'updated_at',
    'vat_number',
    'website',
  ] as const;

  return clientColumns;
}

export function useClientColumns() {
  const { t } = useTranslation();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const disableNavigation = useDisableNavigation();

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  const formatMoney = useFormatMoney();
  const resolveCountry = useResolveCountry();
  const resolveCurrency = useResolveCurrency();
  const resolveLanguage = useResolveLanguage();

  const getContactsColumns = useCallback((client: Client) => {
    const names: string[] = [];

    client.contacts.map((contact) =>
      names.push(`${contact.first_name} ${contact.last_name}`)
    );

    return names.join('<br />');
  }, []);

  const clientColumns = useAllClientColumns();
  type ClientColumns = (typeof clientColumns)[number];

  const [firstCustom, secondCustom, thirdCustom, fourthCustom] =
    useEntityCustomFields({
      entity: 'client',
    });

  const columns: DataTableColumnsExtended<Client, ClientColumns> = [
    {
      column: 'number',
      id: 'number',
      label: t('id_number'),
    },
    {
      column: 'name',
      id: 'display_name',
      label: t('name'),
      format: (value, client) => (
        <Link
          to={route('/clients/:id', { id: client.id })}
          disableNavigation={disableNavigation('client', client)}
        >
          {value}
        </Link>
      ),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.country_id,
          resource?.settings.currency_id
        ),
    },
    {
      column: 'paid_to_date',
      id: 'paid_to_date',
      label: t('paid_to_date'),
      format: (value, resource) =>
        formatMoney(
          value,
          resource?.country_id,
          resource?.settings.currency_id
        ),
    },
    {
      column: 'contact_name',
      id: 'id',
      label: t('contact_name'),
      format: (value, resource) =>
        resource.contacts.length > 0 && (
          <Link
            to={route('/clients/:id', { id: resource.id })}
            disableNavigation={disableNavigation('client', resource)}
          >
            {resource.contacts[0].first_name} {resource.contacts[0].last_name}
          </Link>
        ),
    },
    {
      column: 'contact_email',
      id: 'id',
      label: t('contact_email'),
      format: (value, client) =>
        client.contacts.length > 0 && (
          <CopyToClipboard text={client.contacts[0].email} />
        ),
    },
    {
      column: 'last_login_at',
      id: 'last_login',
      label: t('last_login'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'address2',
      id: 'address2',
      label: t('address2'),
    },
    {
      column: 'archived_at',
      id: 'archived_at',
      label: t('archived_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'contact_phone',
      id: 'id',
      label: t('contact_phone'),
      format: (value, client) => client.contacts[0].phone,
    },
    {
      column: 'contacts',
      id: 'id',
      label: t('contacts'),
      format: (value, client) => (
        <span
          dangerouslySetInnerHTML={{ __html: getContactsColumns(client) }}
        />
      ),
    },
    {
      column: 'country',
      id: 'country_id',
      label: t('country'),
      format: (value) => value && resolveCountry(value)?.name,
    },
    {
      column: 'created_at',
      id: 'created_at',
      label: t('created_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'credit_balance',
      id: 'credit_balance',
      label: t('credit_balance'),
      format: (value, client) =>
        formatMoney(value, client?.country_id, client?.settings.currency_id),
    },
    {
      column: 'currency',
      id: 'id',
      label: t('currency'),
      format: (value, client) =>
        client.settings?.currency_id &&
        resolveCurrency(client.settings.currency_id)?.code,
    },
    {
      column: firstCustom,
      id: 'custom_value1',
      label: firstCustom,
    },
    {
      column: secondCustom,
      id: 'custom_value2',
      label: secondCustom,
    },
    {
      column: thirdCustom,
      id: 'custom_value3',
      label: thirdCustom,
    },
    {
      column: fourthCustom,
      id: 'custom_value4',
      label: fourthCustom,
    },
    {
      column: 'documents',
      id: 'documents',
      label: t('documents'),
      format: (value, client) => client.documents.length,
    },
    {
      column: 'entity_state',
      id: 'id',
      label: t('entity_state'),
      format: (value, client) => <EntityStatus entity={client} />,
    },
    {
      column: 'id_number',
      id: 'id_number',
      label: t('id_number'),
    },
    {
      column: 'is_deleted',
      id: 'is_deleted',
      label: t('is_deleted'),
      format: (value, client) => (client.is_deleted ? t('yes') : t('no')),
    },
    {
      column: 'language',
      id: 'id',
      label: t('language'),
      format: (value, client) =>
        resolveLanguage(
          client.settings.language_id || company.settings.language_id
        )?.name,
    },
    {
      column: 'phone',
      id: 'phone',
      label: t('phone'),
    },
    {
      column: 'private_notes',
      id: 'private_notes',
      label: t('private_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'public_notes',
      id: 'public_notes',
      label: t('public_notes'),
      format: (value) => (
        <Tooltip
          size="regular"
          truncate
          containsUnsafeHTMLTags
          message={value as string}
        >
          <span dangerouslySetInnerHTML={{ __html: value as string }} />
        </Tooltip>
      ),
    },
    {
      column: 'state',
      id: 'state',
      label: t('state'),
    },
    {
      column: 'address1',
      id: 'address1',
      label: t('address1'),
    },
    {
      column: 'task_rate',
      id: 'id',
      label: t('task_rate'),
      format: (value, client) =>
        formatMoney(
          client.settings.default_task_rate ||
            company.settings.default_task_rate,
          client?.country_id,
          client?.settings.currency_id
        ),
    },
    {
      column: 'updated_at',
      id: 'updated_at',
      label: t('updated_at'),
      format: (value) => date(value, dateFormat),
    },
    {
      column: 'vat_number',
      id: 'vat_number',
      label: t('vat_number'),
    },
    {
      column: 'website',
      id: 'website',
      label: t('website'),
      format: (value) => (
        <Link to={value.toString()} external>
          <Inline>
            <span>{value}</span>
            {value.toString().length > 0 && <ExternalLink size={14} />}
          </Inline>
        </Link>
      ),
    },
  ];

  const list: string[] =
    reactSettings?.react_table_columns?.client || defaultColumns;

  return columns
    .filter((column) => list.includes(column.column))
    .sort((a, b) => list.indexOf(a.column) - list.indexOf(b.column));
}
