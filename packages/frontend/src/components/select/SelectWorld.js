import React, {useState} from 'react';
import {Button, Select, Spin} from "antd";
import {useSearchWikiPages} from "../../hooks/wiki/useSearchWikiPages";
import {SearchOutlined} from "@ant-design/icons";
import {useParams} from 'react-router-dom';
import useWorlds from "../../hooks/world/useWorlds";


export const SelectWorld = ({onChange, style, showClear=false, canAdmin}) => {
    const {refetch, worlds, loading} = useWorlds({canAdmin});
    const [value, setValue] = useState();

    const options = worlds && worlds.docs.map((world) => {return <Select.Option key={world._id} value={world._id}>{world.name}</Select.Option>});

    const onSelect = async (newValue) => {
        await setValue(newValue);
        if(onChange){
            for(let world of worlds.docs){
                if(world._id === newValue){
                    await onChange(world);
                }
            }
        }
    };

    return <span>

		<Select
            showSearch
            value={value}
            showArrow={false}
            filterOption={false}
            notFoundContent={loading ? <Spin size="small" /> : null}
            onSearch={async (term) => {await refetch({name: term, canAdmin})}}
            onSelect={onSelect}
            placeholder="Search for a world"
            style={style ? style : { width: 200 }}
            suffixIcon={<SearchOutlined />}
        >
			{options}
		</Select>
        {showClear &&
        <span className={'margin-md-left'}>
				<Button onClick={async () => await onSelect(null)}>Clear</Button>
			</span>
        }
	</span>;
};