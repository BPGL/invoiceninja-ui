/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { Card, Element } from '$app/components/cards';
import { useFormik } from 'formik';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Button, SelectField } from '$app/components/forms';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import Toggle from '$app/components/forms/Toggle';
import { MdClose } from 'react-icons/md';
import { BankAccountSelector } from '$app/pages/transactions/components/BankAccountSelector';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { Alert } from '../Alert';


interface Props {
  entity: string;
  onSuccess: boolean;
  onFileImported?: () => unknown;
  type: string;
}

interface ImportMap extends Record<string, any> {
  hash: string;
  import_type: string;
  skip_header: boolean;
  bank_integration_id?: string;
}

export function UploadImport(props: Props) {
  const [t] = useTranslation();
  const isImportFileTypeZip = props.type === 'zip';
  const acceptableFileExtensions = {
    ...(!isImportFileTypeZip && { 'text/*': ['.csv'] }),
    ...(isImportFileTypeZip && { 'application/zip': ['.zip'] }),
  };

  const [importSettings, setImportSettings] = useState<boolean>(false);
  const [importData, setImportData] = useState<boolean>(false);
  const [formData, setFormData] = useState(new FormData());
  const [files, setFiles] = useState<File[]>([]);
  const [mapData, setMapData] = useState<ImportMap>();
  const [payload, setPayloadData] = useState<ImportMap>({
    hash: '',
    import_type: props.type,
    skip_header: true,
    column_map: { [props.entity]: { mapping: {} } },
  });
  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    payload.column_map[props.entity].mapping[event.target.id] =
      event.target.value;
    setPayloadData(payload);
  };

  const decorateMapping = (mapping: any) => {
    const split_map = mapping.split('.');

    let label_property = split_map[1];

    if (split_map[1] == 'user_id') label_property = 'user';

    if (split_map[1] == 'shipping_country_id')
      label_property = 'shipping_country';

    return `${t(split_map[0])} - ${t(label_property)}`;
  };

  const processImport = () => {
    if (!files.length && isImportFileTypeZip) {
      toast.error('select_file');
      return;
    }

    toast.processing();
    setErrors(undefined);

    let endPointUrl = '/api/v1/import';
    let params = {};

    if (isImportFileTypeZip) {
      if (!importSettings && !importData) {
        toast.error('settings_or_data');
        return;
      } else {
        endPointUrl = '/api/v1/import_json?';

        if (importSettings) {
          endPointUrl += '&import_settings=:import_settings';
          params = {
            import_settings: true,
          };
        }

        if (importData) {
          endPointUrl += '&import_data=:import_data';
          params = {
            ...params,
            import_data: true,
          };
        }
      }
    } else {
      payload.hash = mapData!.hash;
    }

    const requestData = isImportFileTypeZip ? formData : payload;

    request('POST', endpoint(endPointUrl, params), requestData)
      .then((response) => {
        toast.success(response?.data?.message ?? 'error_title');
        props.onFileImported?.();
        props.onSuccess;
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {},
    onSubmit: () => {
      toast.processing();
      setErrors(undefined);

      request('POST', endpoint('/api/v1/preimport'), formData)
        .then((response) => {
          setMapData(response.data);
          props.onSuccess;
          toast.dismiss();

          if (response.data?.mappings[props.entity]?.hints) {
            response.data?.mappings[props.entity]?.hints.forEach(
              (mapping: number, index: number) => {
                payload.column_map[props.entity].mapping[index] =
                  response.data?.mappings[props.entity].available[mapping];
                setPayloadData(payload);
              }
            );
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        });
    },
  });

  const addFilesToFormData = () => {
    files.forEach((file) => {
      formData.append('files', file);
    });

    setFormData(formData);
  };

  const defaultHint = (index: number) => {
    if (!mapData?.mappings[props.entity]?.hints) return null;

    return (
      mapData?.mappings[props.entity].available[
        mapData.mappings[props.entity]?.hints[index]
      ] ?? null
    );
  };

  const removeFileFromFormData = (fileIndex: number) => {
    const filteredFileList = files.filter((file, index) => fileIndex !== index);

    const updatedFormData = new FormData();

    filteredFileList.forEach((file) => {
      updatedFormData.append('files', file);
    });

    setFiles(filteredFileList);

    setFormData(updatedFormData);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptableFileExtensions,
    onDrop: (acceptedFiles) => {
      const isFilesTypeCorrect = acceptedFiles.every(({ type }) =>
        type.includes(props.type)
      );

      if (isFilesTypeCorrect) {
        acceptedFiles.forEach((file) => {
          if (isImportFileTypeZip) {
            setFiles((prevState) => [...prevState, file]);
          } else {
            formData.append(`files[${props.entity}]`, file);
          }
        });

        if (!isImportFileTypeZip) {
          formData.append('import_type', props.entity);
          formik.submitForm();
          setFormData(formData);
        }
      } else {
        toast.error('wrong_file_extension');
      }
    },
  });
  
  const colors = useColorScheme();

  useEffect(() => {
    addFilesToFormData();
  }, [files]);

  return (
    <>
      <Card title={t(props.entity)}>
        <Element
          leftSide={t(isImportFileTypeZip ? 'company_backup_file' : 'csv_file')}
          leftSideHelp={isImportFileTypeZip && t('company_backup_file_help')}
        >
          {!files.length ? (
            <div
              {...getRootProps()}
              className="flex flex-col md:flex-row md:items-center"
            >
              <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <input {...getInputProps()} />
                <Image className="mx-auto h-12 w-12" style={{ color: colors.$3, colorScheme: colors.$0 }} />
                <span className="mt-2 block text-sm font-medium" style={{ color: colors.$3, colorScheme: colors.$0 }}>
                  {isDragActive
                    ? t('drop_file_here')
                    : t('dropzone_default_message')}
                </span>
              </div>

              {errors &&
                Object.keys(errors.errors).map((key, index) => (
                  <Alert key={index} type="danger">
                    {errors.errors[key]}
                  </Alert>
                ))}
            </div>
          ) : (
            <ul className="grid xs:grid-rows-6 lg:grid-cols-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center hover:bg-gray-50 cursor-pointer p-2"
                >
                  {file.name} - {(file.size / 1024).toPrecision(2)} KB{' '}
                  {
                    <MdClose
                      fontSize={15}
                      className="cursor-pointer ml-3"
                      onClick={() => removeFileFromFormData(index)}
                    />
                  }
                </li>
              ))}
            </ul>
          )}
        </Element>

        {isImportFileTypeZip && (
          <>
            <Element leftSide={t('import_settings')}>
              <Toggle
                checked={importSettings}
                onValueChange={(value) => setImportSettings(value)}
              />
            </Element>

            <Element leftSide={t('import_data')}>
              <Toggle
                checked={importData}
                onValueChange={(value) => setImportData(value)}
              />
            </Element>

            <div className="flex justify-end pr-5">
              <Button
                behavior="button"
                onClick={processImport}
                disableWithoutIcon
                disabled={(!importSettings && !importData) || !files.length}
              >
                {t('import')}
              </Button>
            </div>
          </>
        )}
      </Card>

      {mapData && !isImportFileTypeZip && (
        <Table>
          <Thead>
            <Th>{t('header')}</Th>
            <Th>{t('columns')}</Th>
          </Thead>
          <Tbody>
            {mapData.mappings[props.entity].headers[0].map(
              (mapping: any, index: number) => (
                <Tr key={index}>
                  <Td className="space-x-2">
                    <span>{mapping}</span>

                    <span className="text-gray-400">
                      {mapData.mappings[props.entity].headers[1][
                        index
                      ].substring(0, 20)}
                    </span>
                  </Td>
                  <Td>
                    <SelectField
                      id={index}
                      onChange={handleChange}
                      withBlank
                      defaultValue={defaultHint(index)}
                    >
                      {mapData.mappings[props.entity].available.map(
                        (mapping: any, index: number) => (
                          <option value={mapping} key={index}>
                            {decorateMapping(mapping)}
                          </option>
                        )
                      )}
                    </SelectField>
                  </Td>
                </Tr>
              )
            )}
            {props.entity === 'bank_transaction' && (
              <Tr>
                <Td className="space-x-2">
                  <span>{t('bank_account')}</span>
                </Td>
                <Td colSpan={2}>
                  <BankAccountSelector
                    value={payload.bank_integration_id}
                    onChange={(bankAccount) =>
                      setPayloadData((prevState) => ({
                        ...prevState,
                        bank_integration_id: bankAccount?.id,
                      }))
                    }
                    onClearButtonClick={() =>
                      setPayloadData((prevState) => ({
                        ...prevState,
                        bank_integration_id: '',
                      }))
                    }
                    errorMessage={errors?.errors.bank_integration_id}
                  />
                </Td>
              </Tr>
            )}
            <Tr>
              <Td colSpan={2}>
                <Button
                  className="flex float-right"
                  behavior="button"
                  onClick={processImport}
                >
                  {t('import')}
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      )}
    </>
  );
}
