import React, {ReactElement} from 'react';
import {Form} from "antd";
import FormItem, {FormItemProps} from "./FormItem";
import PrimaryButton from "./PrimaryButton";
import Errors from "../Errors";

export default function InputForm<T>({initialValues, onSubmit, children, loading, errors}: {initialValues?: T, onSubmit: (T) => any, children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[], loading: boolean, errors: string[]}) {
    return <Form
        initialValues={initialValues}
        onFinish={onSubmit}
        labelCol={{
            span: 8,
        }}
		wrapperCol={{
            span: 16,
        }}
    >
        {errors && <Errors errors={errors}/>}
        {children}
        <FormItem
            lastItem={true}
        >
            <PrimaryButton submit={true} disabled={loading}>Submit</PrimaryButton>
        </FormItem>
    </Form>
}