import React, {ReactElement} from 'react';
import {Form} from "antd";
import FormItem, {FormItemProps} from "./FormItem";
import PrimaryButton from "./PrimaryButton";

export default function InputForm<T>({initialValues, onSubmit, children}: {initialValues: T, onSubmit: (T) => any, children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[]}) {
    return <Form
        initialValues={initialValues}
        onFinish={onSubmit}
    >
        {children}
        <FormItem>
            <PrimaryButton submit={true}>Submit</PrimaryButton>
        </FormItem>
    </Form>
}