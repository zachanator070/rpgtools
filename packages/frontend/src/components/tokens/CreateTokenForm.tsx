import React, { useState } from 'react';
import InputForm from '../widgets/input/InputForm';
import useCurrentWorld from '../../hooks/world/useCurrentWorld';
import useCreateImage from '../../hooks/wiki/useCreateImage';
import useCreateTokenIcon from '../../hooks/tokens/useCreateTokenIcon';
import { UploadFile } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import ImageInput from '../widgets/input/ImageInput';
import TextInput from '../widgets/input/TextInput';

export default function CreateTokenForm({onSuccess}: {onSuccess?: () => any}) {

    const { currentWorld } = useCurrentWorld();
    const [selectedImageFile, setSelectedImageFile] = useState<UploadFile<any> | undefined | null>(undefined);
    const [tokenName, setTokenName] = useState<string | undefined>(undefined);

    const { createImage, loading: imageLoading, errors: imageErrors } = useCreateImage();
    const { createTokenIcon, loading: tokenLoading, errors: tokenErrors } = useCreateTokenIcon(async (data) => {
        setSelectedImageFile(undefined);
        setTokenName(undefined);
        if (onSuccess && !data.errors) {
            onSuccess();
        }
    });

    return (
        <InputForm 
            loading={imageLoading || tokenLoading}
            errors={[...imageErrors, ...tokenErrors]}
            onSubmit={async () => {
                if (selectedImageFile?.originFileObj) {
                    const imageResult = await createImage({
                            file: selectedImageFile.originFileObj,
                            worldId: currentWorld._id,
                            chunkify: false,
                        });
                        await createTokenIcon({
                            worldId: currentWorld._id,
                            imageId: imageResult._id,
                            name: tokenName || undefined,
                        });
                        setSelectedImageFile(undefined);
                        setTokenName(undefined);
                }
            }}
            buttonText={"Upload Token Icon"}
        >
            <FormItem label={"Image File"} required={true}>
                <ImageInput
                    revertable={false}
                    buttonText={"Select Image"}
                    imageList={selectedImageFile ? [selectedImageFile] : []}
                    initialImage={null}
                    onChange={(file) => {
                        setSelectedImageFile(file);
                    }}
                />
            </FormItem>
            <FormItem label={"Token Name"}>
                <TextInput
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    style={{width: "10rem"}}
                />
            </FormItem>
        </InputForm>
    );
}