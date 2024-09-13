import React, {useState} from 'react';
import {Calendar} from "../../../types.js";
import EditIcon from "../../widgets/icons/EditIcon.js";
import {CALENDAR} from "@rpgtools/common/src/type-constants";
import useCalendars from "../../../hooks/calendar/useCalendars.js";
import PermissionModal from "../../modals/PermissionModal.js";
import PeopleIcon from "../../widgets/icons/PeopleIcon.js";
import EditCalendarModal from "./EditCalendarModal.js";
import useDeleteCalendar from "../../../hooks/calendar/useDeleteCalendar.js";
import LoadingView from "../../LoadingView.js";
import DeleteIcon from "../../widgets/icons/DeleteIcon.js";
import Collapsible from "../../widgets/Collapsible.js";
import useModal from "../../widgets/useModal.js";
import TabCollection from "../../widgets/TabCollection.js";
import AgeEditor from "./AgeEditor.js";

export default function CalendarItem({calendar}: {calendar: Calendar}) {
    const {refetch} = useCalendars();
    const {deleteCalendar, loading: deleteLoading} = useDeleteCalendar();
    const [modalVisible, setModalVisible] = useState(false);
    const [permissionModalVisibility, setPermissionModalVisibility] = useState(false);

    const {modalConfirm} = useModal();

    if(deleteLoading) {
        return <LoadingView/>;
    }

    return <div className={'margin-md-bottom'}>
        <h3>
            {calendar.name}
            <span className={'margin-md-left'}>
                {calendar.canWrite &&
                    <>
                        <a onClick={() => setModalVisible(true)}>
                            <EditIcon/>
                        </a>
                        <EditCalendarModal
                            calendar={calendar}
                            visible={modalVisible}
                            setVisible={setModalVisible}
                        />
                    </>
                }
                {calendar.canWrite &&
                    <a
                        onClick={() => modalConfirm({
                            title: 'Confirm Deletion',
                            content: `Are you sure you want to delete calendar ${calendar.name}?`,
                            onOk: async () => await deleteCalendar({calendarId: calendar._id})
                        })}
                    >
                        <DeleteIcon/>
                    </a>
                }
                {calendar.canAdmin &&
                    <>
                        <a onClick={() => setPermissionModalVisibility(!permissionModalVisibility)}>
                            <PeopleIcon/>
                        </a>
                        <PermissionModal
                            refetch={refetch}
                            setVisibility={async (visible) => setPermissionModalVisibility(visible)}
                            subject={calendar}
                            subjectType={CALENDAR}
                            visibility={permissionModalVisibility}
                        />
                    </>
                }
            </span>

        </h3>
        <div className={'margin-md-left'}>
            <Collapsible title={'Ages'} startOpen={false}>
                <TabCollection
                    tabs={[
                    ...calendar.ages.map((age, index) => {
                        return {
                            title: calendar.ages.at(index).name,
                            key: index,
                            children: <AgeEditor
                                editable={false}
                                age={age}
                            />
                        }
                    })
                ]}/>
            </Collapsible>

        </div>
    </div>;
}