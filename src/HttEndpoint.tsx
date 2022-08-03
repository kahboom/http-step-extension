import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    FormFieldGroup,
    FormFieldGroupHeader,
    FormGroup, Grid, GridItem, Label, TextInput
} from "@patternfly/react-core";
import * as React from "react";
import {IEndpoint} from "./HttpStep";
import {ReactComponentElement, ReactElement, useEffect, useState} from "react";
import {OpenAPI} from "openapi-types";

export type HttpEndpointProps = {
    endpoint: IEndpoint;
}
export const HttpEndpoint = (props: HttpEndpointProps) => {

    const [isOpen, setIsOpen] = useState(false);
    // const [currentEndpoint,setCurrentEndpoint] = useState<Operation>({});
    const [methods, setMethods] = useState<Map<string, OpenAPI.Operation>>(new Map());
    const [currentMethod, setCurrentMethod] = useState('');
    const [summary, setSummary] = useState('');

    useEffect(() => {
        const methodsMap: Map<string, OpenAPI.Operation> = new Map<string, OpenAPI.Operation>();
        console.log(props.endpoint?.pathItem);
        Object.entries(props.endpoint?.pathItem).forEach((method => {
            console.log(method);
            methodsMap.set(method[0], method[1]);

        }));
        setMethods(methodsMap);
        if (methods.size > 0) {
            const [m] = methods.keys();
            selectMethod(m);
        }
    }, [props.endpoint])

    const onToggle = (isOpen: boolean) => {
        setIsOpen(isOpen);
    };

    const selectMethod = (name: string) => {
        setCurrentMethod(name);
        setIsOpen(false);
        setSummary(methods.get(name)?.summary);
    }

    const dropdownMethodsItems: Array<ReactElement> = [];
    methods.forEach((v, method) => {
        dropdownMethodsItems.push(
            <DropdownItem key={method} onClick={() => {
                selectMethod(method)
            }}>
                {method}</DropdownItem>
        )
    });

    const ParamFields = () => {
        let fieldList: React.ReactElement[] = [];
        methods.get(currentMethod)?.parameters?.forEach((p, index) => {
            console.log(p);
            fieldList.push(
                <FormGroup key={"key" + index} label={p.name} fieldId={"id" + index}>
                    <TextInput key={"key" + index} label={p.name} id={"idTextInput-" + p.name}
                               name={"nameTextIpnut" + p.name}/>
                </FormGroup>
            )
        });

        return <FormGroup label="Params" fieldId="simple-form-note-01">
            {fieldList}
        </FormGroup>
    }

    type OperationInfoProps = {
        produces:string,
        consumes: string,
        summary: string,
        tags: string[],
    }
    const OperationInfo = () => {
        return <Grid>
            <GridItem span={6}>Summary</GridItem>
            <GridItem span={6}>
                <div>{summary}</div>
            </GridItem>

        </Grid>
    }
    return <FormGroup label="Endpoint info">
        <Dropdown type="text" id="simple-form-note-01" name="simple-form-number" value="disabled"
                  dropdownItems={dropdownMethodsItems}
            // onSelect={selectApi}
                  isOpen={isOpen}
                  toggle={
                      <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                          {currentMethod}
                      </DropdownToggle>
                  }/>


        <ParamFields/>

        <FormGroup>
        </FormGroup>

    </FormGroup>
};
