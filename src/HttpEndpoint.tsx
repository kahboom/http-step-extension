import { IEndpoint } from './HttpStep';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
} from '@patternfly/react-core';
import { OpenAPI } from 'openapi-types';
import { ReactElement, useRef, useState } from 'react';

const ParamFields = ({ parameters, handleChange }) => {
  const fieldList: ReactElement[] = [];

  parameters.forEach((v, name, index) => {
    fieldList.push(
      <FormGroup key={'key' + name + index} label={name} fieldId={'id' + name}>
        <TextInput
          //key={"inputKey" + name+index}
          value={v}
          label={name}
          id={'idTextInput-' + name}
          name={'nameTextInput' + name}
          //
          onChange={(value, event) => {
            handleChange(name, value);
          }}
        />
      </FormGroup>
    );
  });
  return (
    fieldList.length > 0 && (
      <FormGroup label="Params" fieldId="simple-form-note-01">
        {fieldList}
      </FormGroup>
    )
  );
};

export type HttpEndpointProps = {
  endpoint: IEndpoint;
  endpointUrl: string;
  setUrl: (value: string) => void;
};

export const HttpEndpoint = (props: HttpEndpointProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState('');
  const parameters = useRef<Map<string, string>>(new Map());

  const [path, setPath] = useState('');
  const methodsMap: Map<string, OpenAPI.Operation> = new Map<string, OpenAPI.Operation>();
  // @ts-ignore
  Object.entries(props.endpoint?.pathItem).forEach((method) => {
    methodsMap.set(method[0], method[1]);
  });

  //let params = new Map();
  if (methodsMap.size > 0) {
    const [m] = methodsMap.keys();
    if (currentMethod !== m) {
      setCurrentMethod(m);
    }
    const params = getParameters(methodsMap.get(currentMethod));
    const [existing] = parameters.current?.keys();
    const [nw] = params.keys();

    if (parameters.current.size === 0 || nw !== existing) {
      parameters.current = params;
    }
  }

  function getParameters(method?: OpenAPI.Operation): Map<string, string> {
    const parameters: Map<string, string> = new Map<string, string>();
    //
    method?.parameters?.forEach((v) => {
      parameters.set(v.name, '');
    });
    return parameters;
  }

  function getParameter(key: string): OpenAPI.Parameter {
    let found: OpenAPI.Parameter;
    methodsMap.get(currentMethod)?.parameters?.forEach((v: OpenAPI.Parameter) => {
      if (v.name.toString() === key) {
        found = v;
      }
    });

    return found;
  }

  function selectMethod(name: string) {
    const params: Map<string, string> = getParameters(methodsMap.get(name));
    parameters.current = new Map(params);
    setCurrentMethod(name);
    setIsOpen(false);
  }

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const dropdownMethodsItems: Array<ReactElement> = [];
  methodsMap.forEach((v, method) => {
    dropdownMethodsItems.push(
      <DropdownItem
        key={method}
        onClick={() => {
          selectMethod(method);
        }}
      >
        {method}
      </DropdownItem>
    );
  });

  const handleChange = (name: string, value: string) => {
    parameters.current.set(name, value);

    let uri = props.endpointUrl;
    let p = '';
    parameters.current.forEach((val, key) => {
      if (val) {
        const param: OpenAPI.Parameter = getParameter(key);
        if (param.in === 'path') {
          uri = uri.replace(`{${key}}`, val);
        } else if (param.in === 'query') {
          p = p + `&${key}=${val}`;
        }
      }
    });
    if (p.length > 0) {
      p = '?' + p.substr(1);
    }

    // setPath(p);
    props.setUrl(uri + p);
  };

  type PathProperties = { path: string };
  const PathField = (props: PathProperties) => {
    return <div>{props.path}</div>;
  };

  type OperationInfoProps = {
    produces: string;
    consumes: string;
    summary: string;
    tags: string[];
  };

  return (
    <FormGroup label="Endpoint info">
      <Dropdown
        type="text"
        id="simple-form-note-01"
        name="simple-form-number"
        value="disabled"
        dropdownItems={dropdownMethodsItems}
        isOpen={isOpen}
        toggle={
          <DropdownToggle id="toggle-basic" onToggle={onToggle}>
            {currentMethod}
          </DropdownToggle>
        }
      />
      <ParamFields parameters={parameters.current} handleChange={handleChange} />

      <FormGroup>
        <Grid>
          <GridItem span={6}>Summary</GridItem>
          <GridItem span={6}>
            <div>{methodsMap.get(currentMethod)?.summary}</div>
          </GridItem>

          {methodsMap.get(currentMethod)?.description && (
            <div>
              <GridItem span={6}>Description</GridItem>
              <GridItem span={6}>
                <div>{methodsMap.get(currentMethod)?.description}</div>
              </GridItem>
            </div>
          )}

          <GridItem span={6}>Tags</GridItem>
          <GridItem span={6}>
            <div>{methodsMap.get(currentMethod)?.tags}</div>
          </GridItem>
          <GridItem span={6}>Produces</GridItem>
          <GridItem span={6}>
            <div>{methodsMap.get(currentMethod)?.produces}</div>
          </GridItem>
        </Grid>
      </FormGroup>
    </FormGroup>
  );
};
