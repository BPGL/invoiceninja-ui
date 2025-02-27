/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateChanges } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { CustomField } from '$app/components/CustomField';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { LanguageSelector } from '$app/components/LanguageSelector';
import Toggle from '$app/components/forms/Toggle';
import { useAtom } from 'jotai';
import { hasLanguageChanged } from '../../localization/common/atoms';

export function Details() {
  const [t] = useTranslation();

  const errors: ValidationBag = useOutletContext();

  const user = useCurrentUser();

  const dispatch = useDispatch();

  const company = useCurrentCompany();

  const [, setHasLanguageIdChanged] = useAtom(hasLanguageChanged);

  const userChanges = useSelector((state: RootState) => state.user.changes);

  const handleChange = (property: string, value: string | number | boolean) => {
    dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  return (
    <>
      {userChanges && (
        <Card title={t('details')}>
          <Element leftSide={t('first_name')}>
            <InputField
              value={userChanges?.first_name || user?.first_name || ''}
              onValueChange={(value) => handleChange('first_name', value)}
              errorMessage={(errors?.errors?.first_name ?? [])[0]}
            />
          </Element>

          <Element leftSide={t('last_name')}>
            <InputField
              value={userChanges?.last_name || user?.last_name || ''}
              onValueChange={(value) => handleChange('last_name', value)}
              errorMessage={(errors?.errors?.last_name ?? [])[0]}
            />
          </Element>

          <Element leftSide={t('email')}>
            <InputField
              value={userChanges?.email || user?.email || ''}
              type="email"
              onValueChange={(value) => handleChange('email', value)}
              errorMessage={(errors?.errors?.email ?? [])[0]}
            />
          </Element>

          <Element leftSide={t('language')}>
            <LanguageSelector
              value={userChanges?.language_id || ''}
              onChange={(v) => {
                setHasLanguageIdChanged(true);
                handleChange('language_id', v);
              }}
              errorMessage={(errors?.errors?.language_id ?? [])[0]}
              dismissable
            />
          </Element>

          <Element leftSide={t('phone')}>
            <InputField
              value={userChanges?.phone || user?.phone || ''}
              onValueChange={(value) => handleChange('phone', value)}
              errorMessage={(errors?.errors?.phone ?? [])[0]}
            />
          </Element>

          <Element
            leftSide={t('login_notification')}
            leftSideHelp={t('login_notification_help')}
          >
            <Toggle
              checked={userChanges?.user_logged_in_notification}
              onChange={(value) =>
                handleChange('user_logged_in_notification', value)
              }
            />
          </Element>

          {company?.custom_fields?.user1 && (
            <CustomField
              field="user1"
              defaultValue={userChanges.custom_value1}
              value={company.custom_fields.user1}
              onValueChange={(value) => handleChange('custom_value1', value)}
            />
          )}

          {company?.custom_fields?.user2 && (
            <CustomField
              field="user2"
              defaultValue={userChanges.custom_value2}
              value={company.custom_fields.user2}
              onValueChange={(value) => handleChange('custom_value2', value)}
            />
          )}

          {company?.custom_fields?.user3 && (
            <CustomField
              field="user3"
              defaultValue={userChanges.custom_value3}
              value={company.custom_fields.user3}
              onValueChange={(value) => handleChange('custom_value3', value)}
            />
          )}

          {company?.custom_fields?.user4 && (
            <CustomField
              field="user4"
              defaultValue={userChanges.custom_value4}
              value={company.custom_fields.user4}
              onValueChange={(value) => handleChange('custom_value4', value)}
            />
          )}
        </Card>
      )}
    </>
  );
}
