import {
    Form,
    FormGroup,
    TextInput,
    Popover,
    ActionGroup,
    Button,
    FileUpload, Dropdown, DropdownItem, DropdownToggle, InputGroup, Checkbox
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import styles from '@patternfly/react-styles/css/components/Button/button';
import * as React from "react"
import {ReactElement, useEffect, useRef, useState} from "react";

import SwaggerParser from "@apidevtools/swagger-parser";
import {OpenAPI, OpenAPIV3, OpenAPIV2, OpenAPIV3_1} from "openapi-types";
import {HttpEndpoint} from "./HttEndpoint";

//TODO distinguish between source/sink type of extension

export interface IEndpoint {
    name: string,
    pathItem: OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject | undefined;
    operations: Map<string, OpenAPI.Operation>;

}

async function parseApiSpec(input: string | OpenAPI.Document): Promise<IEndpoint[]> {
    let swaggerParser: SwaggerParser = new SwaggerParser();

    const e: Array<IEndpoint> = [];
    let api: OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document;

    try {
        api = await swaggerParser.validate(input, {dereference: {circular: "ignore"},});
        Object.entries(swaggerParser.api.paths).forEach(p => e.push({name: p[0], pathItem: p[1]}));
    } catch (error) {
        console.error('error ' + error);
    }
    return e;
}

const HttpStep: React.FunctionComponent = (props: any) => {
    const [openApiSpecText, setOpenApiSpecText] = useState('');
    const endpoints = useRef<IEndpoint[]>([]);
    const [current, setCurrent] = useState<IEndpoint>({name: '', pathItem: {}, operations: new Map()});
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [upload, setUpload] = useState<boolean>(false);
    const [paramString, setParamString] = useState<string>('');
    const [fullUrl, setFullUrl] = useState<string>('');
    const [basePath, setBasePath] = useState<string>('');
    const [apiSpecUrl, setApiUrl] = useState<string>("https://api.chucknorris.io/documentation");

    const parseSpec = async (input: string) => {
        endpoints.current = await parseApiSpec(input);
        setCurrent(endpoints.current[0]);
    }

    useEffect(() => {
        let apiDoc = '';
        if (upload && openApiSpecText !== '') {
            apiDoc = JSON.parse(openApiSpecText);
            parseSpec(apiDoc).catch(console.error);
        }
    }, [openApiSpecText, upload],);

    const onToggle = (isOpen: boolean) => {
        setIsOpen(isOpen);
    };

    const handleFileInputChange = (
        _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
        file: File
    ) => {
        file.text().then(input => {
            setOpenApiSpecText(input)
        });
    };

    function selectApiEndpoint(index: number) {
        setIsOpen(false);
        setCurrent(endpoints.current[index]);
    }

    const dropdownEndpointsItems: Array<ReactElement> = [];

    endpoints.current.forEach((e, index) => {
        dropdownEndpointsItems.push(
            <DropdownItem key={e.name} onClick={() => {
                selectApiEndpoint(index)
                constructUrl(e.name);
            }}>
                {e.name}
            </DropdownItem>,
        );
    })

    const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setOpenApiSpecText('');
    };

    function setValue() {
        props.notifyKaoto('Message from my remote Step Extension!', 'this is the description of the notification', 'success');
        let data: any;

    }

    const handleClick = () => {
        props.notifyKaoto('Message from my remote Step Extension!', 'this is the description of the notification', 'success');
    }

    const handleLoadClick = () => {
        parseSpec(apiSpecUrl).catch(console.error);
    }

    const constructUrl = (urParameters:string,bPath?:string) => {
        setParamString(urParameters);
        if(bPath!== undefined) {
            setBasePath(bPath);
            setFullUrl(bPath+urParameters);
        } else {
            setFullUrl(basePath+urParameters);
        }
    }
    return <Form>
        <FormGroup label="OpenApi" fieldId="open-api-file-upload">
            <Checkbox id='inputType' label='Upload spec' isChecked={upload} onChange={setUpload}/>

            {upload && <FileUpload
                id="simple-file"
                value={openApiSpecText}
                filenamePlaceholder="Drag and drop a open API spec or upload one"
                onFileInputChange={handleFileInputChange}
                onClearClick={handleClear}
                browseButtonText="Upload"
            />}
            {!upload &&
                <InputGroup>
                    <TextInput id='specUrlInput' aria-label="Api spec url" value={apiSpecUrl} onChange={setApiUrl}/>
                    <Button onClick={handleLoadClick}>Load</Button>
                </InputGroup>
            }

        </FormGroup>
        <FormGroup label="Base Path">
            <InputGroup>
                <TextInput id="basePathInput" aria-label="Base path" value={basePath} onChange={(value:string) => {
                    constructUrl(paramString,value)}
                }/>
                <Dropdown minLength={500} type="text" id="simple-form-note-01" name="simple-form-number"
                          value="disabled"
                          dropdownItems={dropdownEndpointsItems}
                          isOpen={isOpen}
                          toggle={
                              <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                                  {current?.name}
                              </DropdownToggle>
                          }/>
            </InputGroup>
        </FormGroup>
        {current?.name !== '' && <HttpEndpoint endpointUrl={current.name} endpoint={current} setUrl={constructUrl}/>}
        <ActionGroup>
            <Button className={css(styles.button)} variant="primary" onClick={setValue}>Submit</Button>
            <Button variant="link">Cancel</Button>
            <Button variant="link" onClick={handleClick}>nofify</Button>
        </ActionGroup>
        <h3>{fullUrl}</h3>
    </Form>;
};

export default HttpStep;
