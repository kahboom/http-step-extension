import { HttpEndpoint } from './HttEndpoint';
import SwaggerParser from '@apidevtools/swagger-parser';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  FileUpload,
  InputGroup,
  Checkbox,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { OpenAPI, OpenAPIV3, OpenAPIV2, OpenAPIV3_1 } from 'openapi-types';
import { ReactElement, useEffect, useRef, useState } from 'react';

//TODO distinguish between source/sink type of extension

export interface IEndpoint {
  name: string;
  pathItem:
    | OpenAPIV2.PathItemObject
    | OpenAPIV3.PathItemObject
    | OpenAPIV3_1.PathItemObject
    | undefined;
  operations: Map<string, OpenAPI.Operation>;
}

async function parseApiSpec(input: string | OpenAPI.Document): Promise<IEndpoint[]> {
  let swaggerParser: SwaggerParser = new SwaggerParser();
  console.log(input);

  const e: Array<IEndpoint> = [];
  let api: OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document;

  try {
    api = await swaggerParser.validate(input, { dereference: { circular: 'ignore' } });
    // @ts-ignore
    Object.entries(swaggerParser.api.paths).forEach((p) => e.push({ name: p[0], pathItem: p[1] }));
    console.log(api);
  } catch (error) {
    console.error('error ' + error);
  }
  return e;
}

const HttpStep = (props: any) => {
  const [openApiSpecText, setOpenApiSpecText] = useState('');
  const endpoints = useRef<IEndpoint[]>([]);
  const [currentEndpoint, setCurrentEndpoint] = useState<IEndpoint>({
    name: '',
    pathItem: {},
    operations: new Map(),
  });
  const [upload, setUpload] = useState<boolean>(false);
  const [paramString, setParamString] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [fullUrl, setFullUrl] = useState<string>('');
  const [basePath, setBasePath] = useState<string>('');
  const [apiSpecUrl, setApiUrl] = useState<string>('https://api.chucknorris.io/documentation');

  const parseSpec = async (input: string) => {
    endpoints.current = await parseApiSpec(input);
    setCurrentEndpoint(endpoints.current[0]);
  };

  // console.log(__webpack_share_scopes__.default);

  useEffect(() => {
    let apiDoc = '';
    if (upload && openApiSpecText !== '') {
      apiDoc = JSON.parse(openApiSpecText);
      parseSpec(apiDoc).catch(console.error);
    }
  }, [openApiSpecText, upload]);

  // const onToggle = (isOpen: boolean) => {
  //     setIsOpen(isOpen);
  // };

  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    file.text().then((input) => {
      setOpenApiSpecText(input);
    });
  };

  function selectApiEndpoint(index: string) {
    const i = Number(index);
    setSelectedEndpoint(index);
    setCurrentEndpoint(endpoints.current[i]);

    constructUrl(endpoints.current[i]?.name);
  }

  const dropdownEndpointsItems: Array<ReactElement> = [];

  endpoints.current.forEach((e, index) => {
    dropdownEndpointsItems.push(
      <FormSelectOption key={e.name} value={index} label={e.name} isDisabled={false} />
    );
  });

  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setOpenApiSpecText('');
  };

  function setValue() {
    props.notifyKaoto(
      'Message from my remote Step Extension!',
      'this is the description of the notification',
      'success'
    );
    // let data: any;
  }

  const handleClick = () => {
    props.notifyKaoto(
      'Message from my remote Step Extension!',
      'this is the description of the notification',
      'success'
    );
  };

  const handleLoadClick = () => {
    parseSpec(apiSpecUrl).catch(console.error);
  };

  const constructUrl = (urParameters: string, bPath?: string) => {
    setParamString(urParameters);
    if (bPath !== undefined) {
      setBasePath(bPath);
      setFullUrl(bPath + urParameters);
    } else {
      setFullUrl(basePath + urParameters);
    }
  };
  return (
    <Form>
      <FormGroup label="OpenApi" fieldId="open-api-file-upload">
        <Checkbox id="inputType" label="Upload spec" isChecked={upload} onChange={setUpload} />

        {upload && (
          <FileUpload
            id="simple-file"
            value={openApiSpecText}
            filenamePlaceholder="Drag and drop a open API spec or upload one"
            onFileInputChange={handleFileInputChange}
            onClearClick={handleClear}
            browseButtonText="Upload"
          />
        )}
        {!upload && (
          <InputGroup>
            <TextInput
              id="specUrlInput"
              aria-label="Api spec url"
              value={apiSpecUrl}
              onChange={setApiUrl}
            />
            <Button onClick={handleLoadClick}>Load</Button>
          </InputGroup>
        )}
      </FormGroup>
      <FormGroup label="Base Path">
        <InputGroup>
          <TextInput
            id="basePathInput"
            aria-label="Base path"
            value={basePath}
            onChange={(value: string) => {
              constructUrl(paramString, value);
            }}
          />
          <FormSelect
            minLength={500}
            type="text"
            id="simple-form-note-01"
            name="simple-form-number"
            value={selectedEndpoint}
            onChange={selectApiEndpoint}
          >
            {dropdownEndpointsItems}
          </FormSelect>
        </InputGroup>
      </FormGroup>
      {currentEndpoint?.name !== '' && (
        <HttpEndpoint
          endpointUrl={currentEndpoint.name}
          endpoint={currentEndpoint}
          setUrl={constructUrl}
        />
      )}
      <ActionGroup>
        <Button variant="primary" onClick={setValue}>
          Submit
        </Button>
        <Button variant="link">Cancel</Button>
        <Button variant="link" onClick={handleClick}>
          nofify
        </Button>
      </ActionGroup>
      <h3>{fullUrl}</h3>
    </Form>
  );
};

export default HttpStep;
