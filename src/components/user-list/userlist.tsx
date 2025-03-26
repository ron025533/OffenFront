import { useEffect, useState } from "react";
import "./userlist.css"

const Userlist = ({users}:{users: string[]}) => {

    const [userList, setUserList] = useState<string[]>([]);

    useEffect(() =>{
        setUserList(users);
    },[users])

    return <div className="left-list">

        <div className="list-text">Liste Étudiants</div>

        {
            userList.map(user =>
                <div className="user-block">
                    {user}
                    <div className="online"></div>
                </div>
            )
        }

    </div>;
};

export default Userlist;