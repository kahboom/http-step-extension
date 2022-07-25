import {
    Form,
    FormGroup,
    TextInput,
    Popover,
    ActionGroup,
    Button,
    FileUpload, Dropdown, DropdownItem, DropdownToggle
} from '@patternfly/react-core';
import * as React from "react"
import {ReactElement, useEffect, useRef, useState} from "react";
import { css } from '@patternfly/react-styles';
//import  "@patternfly/patternfly/components/Button/Button.scss";
import "@patternfly/patternfly/patternfly.css";
import SwaggerParser from "@apidevtools/swagger-parser";

interface IEndpoint {
    name: string,
    produces: string
}
 function parseApiSpec(input: string): IEndpoint[] {
     const api: any = JSON.parse(input);
     const paths = api.paths;
     // paths.forEach(p => console.log(p))
     //    console.log(Object.entries(paths));
     const e: Array<IEndpoint> = [];
     Object.entries(paths).forEach(p => {
         console.log(p);
         e.push({name: p[0], produces: 'application/json'});
     });
     return e;
 }

const HttpStep: React.FunctionComponent = (props: any) => {
    const [openApiSpecText, setOpenApiSpecText] = useState('');
    const endpoints = useRef<IEndpoint[]>([]);
    const [current,setCurrent] = useState<IEndpoint>({name:'',produces:''});
    const [isOpen, setIsOpen] = useState(false);
    const [selected,setSelected] = useState("");

    useEffect(() => {
        if (openApiSpecText !== '') {
            endpoints.current = parseApiSpec(openApiSpecText);
            setCurrent(endpoints.current[0]);
        }
    }, [openApiSpecText]);

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

    function selectApiEndpoint(index:number) {
        setIsOpen(false);
        setCurrent(endpoints.current[index]);

    }

    const dropdownItems: Array<ReactElement> = [];

    endpoints.current.forEach((e, index) => {
        dropdownItems.push(
            <DropdownItem key={e.name} onClick={()=>{
                selectApiEndpoint(index)
            }}>
                {e.name}
            </DropdownItem>,
        );
    })

    const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        //  setFilename('');
        setOpenApiSpecText('');
    };

    function setValue() {
        props.notifyKaoto('Message from my remote Step Extension!', 'this is the description of the notification', 'success');
        let data:any;

    }

    const handleClick = () => {
        console.log("click");
        props.notifyKaoto('Message from my remote Step Extension!', 'this is the description of the notification', 'success');
    }

    return <Form>
        <FormGroup fieldId="open-api-file-upload">
            <FileUpload
                id="simple-file"
                value={openApiSpecText}
                filenamePlaceholder="Drag and drop a open API spec or upload one"
                onFileInputChange={handleFileInputChange}
                onClearClick={handleClear}
                browseButtonText="Upload"
            />
        </FormGroup>

        <FormGroup label="Endpoints" fieldId="simple-form-note-01">
            <Dropdown type="text" id="simple-form-note-01" name="simple-form-number" value="disabled"
                      dropdownItems={dropdownItems}
                     // onSelect={selectApi}
                      isOpen={isOpen}
                      toggle={
                          <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                              {current.name}
                          </DropdownToggle>
                      }/>
            {selected}
        </FormGroup>

        <ActionGroup>
            <Button variant="primary" onClick={setValue}>Submit</Button>
            <Button variant="link">Cancel</Button>
            <Button variant="link" onClick={handleClick}>nofify</Button>
        </ActionGroup>
    </Form>;
};
const HttpExtension = (props) => {


    return <Button/>
}

export default HttpStep;
