import React, {ReactElement, useState} from 'react';
import {Form} from "antd";
import FormItem, {FormItemProps} from "./FormItem";
import PrimaryButton from "../PrimaryButton";
import Errors from "../../Errors";
import {WidgetProps} from "../WidgetProps";

interface InputFormProps<T> extends WidgetProps {
    onSubmit: (T) => any;
    children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[];
    loading: boolean;
    errors: string[];
}

export default function InputForm<T>({ onSubmit, children, loading, errors}: InputFormProps<T>) {

    return <Form
        onFinish={() => {}}
        labelCol={{
            span: 8,
        }}
		wrapperCol={{
            span: 8,
        }}
        onValuesChange={(changedValues, allValues) => {
            console.log(changedValues);
            console.log(allValues);
        }}
        onSubmitCapture={(event) => {
            const values = {};
            for (let key of (event.target as HTMLFormElement).elements) {
                const name = (key as HTMLInputElement)?.name;
                const value = (key as HTMLInputElement)?.value;
                if (name && value) {
                    values[name] = value;
                }
            }
            onSubmit(values);
        }}
    >
        <div>
            <div style={{flexGrow: 2}}/>
            <div style={{flexGrow: 1}}>
                {errors && <Errors errors={errors}/>}
            </div>
            <div style={{flexGrow: 2}}/>
        </div>

        {children}
        <FormItem
            lastItem={true}
        >
            <PrimaryButton submit={true} disabled={loading}>Submit</PrimaryButton>
        </FormItem>
    </Form>
}