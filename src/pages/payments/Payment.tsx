/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Payment as PaymentEntity } from '$app/common/interfaces/payment';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Page } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tabs } from '$app/components/Tabs';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks/useActions';
import { useSave } from './edit/hooks/useSave';
import { useTabs } from './edit/hooks/useTabs';

export default function Payment() {
  const [t] = useTranslation();

  const { id } = useParams();

  const { data } = usePaymentQuery({ id });

  const [paymentValue, setPaymentValue] = useState<PaymentEntity>();

  const [errors, setErrors] = useState<ValidationBag>();

  const pages: Page[] = [
    { name: t('payments'), href: '/payments' },
    {
      name: t('edit_payment'),
      href: route('/payments/:id/edit', { id: id }),
    },
  ];

  const tabs = useTabs({ payment: paymentValue });

  const onSave = useSave(setErrors);

  const actions = useActions();

  useEffect(() => {
    if (data) {
      setPaymentValue(data);
    }
  }, [data]);

  return (
    <Default
      title={t('payment')}
      breadcrumbs={pages}
      onSaveClick={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(paymentValue as unknown as PaymentEntity);
      }}
      disableSaveButton={!paymentValue}
      navigationTopRight={
        paymentValue && (
          <ResourceActions
            label={t('more_actions')}
            resource={paymentValue}
            actions={actions}
          />
        )
      }
    >
      <Container>
        <Tabs tabs={tabs} disableBackupNavigation />

        <Outlet
          context={{
            errors,
            payment: paymentValue,
            setPayment: setPaymentValue,
          }}
        />
      </Container>
    </Default>
  );
}
