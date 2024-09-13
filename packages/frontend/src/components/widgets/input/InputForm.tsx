import React, {ReactElement, useState} from 'react';
import {Form} from "antd";
import FormItem, {FormItemProps} from "./FormItem.js";
import PrimaryButton from "../PrimaryButton.js";
import Errors from "../../Errors.js";
import {WidgetProps} from "../WidgetProps.js";
import LoadingIcon from "../icons/LoadingIcon.js";

interface InputFormProps<T> extends WidgetProps {
    onSubmit: (T) => any;
    children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[];
    loading: boolean;
    errors: string[];
    buttonText?: string;
    disabled?: boolean;
}

export default function InputForm<T>({ onSubmit, children, loading, errors, buttonText, disabled}: InputFormProps<T>) {

    return <Form
        onFinish={() => {}}
        labelCol={{
            span: 8,
        }}
		wrapperCol={{
            span: 16,
        }}
        onValuesChange={(changedValues, allValues) => {
            console.log(changedValues);
            console.log(allValues);
        }}
        onSubmitCapture={(event) => {
            const values = {};
            for (const key of (event.target as HTMLFormElement).elements) {
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
            <PrimaryButton id={'submit'} submit={true} disabled={loading || disabled}>{loading? <LoadingIcon/> : (buttonText || 'Submit')}</PrimaryButton>
        </FormItem>
    </Form>
}