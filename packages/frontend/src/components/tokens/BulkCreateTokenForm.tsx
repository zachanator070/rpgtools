import React from 'react';
import { useParams } from 'react-router-dom';
import useBulkCreateTokenIcon from '../../hooks/tokens/useBulkCreateTokenIcons';
import FormItem from '../widgets/input/FormItem';
import FileInput from '../widgets/input/FileInput';
import InputForm from '../widgets/input/InputForm';

export default function BulkCreateTokenForm({onSuccess}: {onSuccess?: () => any}) {
    const [file, setFile] = React.useState<File | null>(null);
    const {bulkCreateTokenIcon, loading, errors} = useBulkCreateTokenIcon((data) => {
        if (onSuccess && !data.errors) {
            onSuccess();
        }
    });
    const {world_id} = useParams();

    return <InputForm
        loading={loading}
        errors={errors}
        onSubmit={async () => {
            await bulkCreateTokenIcon({
                worldId: world_id,
                zipFile: file
            });
        }}
        >
            <FormItem
                label="Zip File"
                required>
                    <FileInput accept=".zip" onChange={function (any: any) {
                        if (any.fileList && any.fileList.length > 0) {
                            setFile(any.fileList[0].originFileObj);
                        } else {
                            setFile(null);
                        }
                    } } />
            </FormItem>
        </InputForm>;
            
}