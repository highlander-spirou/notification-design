import { useEffect, useState } from "react";
import {
  BellIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  Settings2Icon,
  UserIcon,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";

import { ScrollArea } from "./components/ui/scroll-area";
import { io } from "socket.io-client";
import moment from "moment-timezone";
import { Input } from "./components/ui/input";

const socket = io("http://localhost:4000");

export interface INotification {
  bodyText: string;
  notiType: "database" | "record" | "user";
  createdAt: string;
  ownerId: string;
}

const calculateMomentsAgo = (dateString) => {
  const timezone = "Asia/Ho_Chi_Minh";

  // Current datetime in the specified timezone
  const now = moment().tz(timezone);

  // Given datetime in the specified timezone
  const givenDate = moment.tz(dateString, timezone);

  // Calculate the difference in various units
  const diffSeconds = now.diff(givenDate, "seconds");
  const diffMinutes = now.diff(givenDate, "minutes");
  const diffHours = now.diff(givenDate, "hours");
  const diffDays = now.diff(givenDate, "days");

  // Return the appropriate formatted difference
  if (diffSeconds <= 59) {
    return diffSeconds + " seconds ago";
  } else if (diffMinutes <= 59) {
    return diffMinutes + " minutes ago";
  } else if (diffHours <= 23) {
    return diffHours + " hours ago";
  } else {
    return diffDays + " days ago";
  }
};

const NotiBodyText = ({ text }) => {
  return (
    <p className="line-clamp-2 text-sm font-medium text-slate-700">{text}</p>
  );
};

const NotiTime = ({ timeString }) => {
  return (
    <p className="text-xs text-muted-foreground font-medium text-blue-600">
      {calculateMomentsAgo(timeString)}
    </p>
  );
};

const NotiTypeIcon = ({ type }: { type: "database" | "record" | "user" }) => {
  switch (type) {
    case "database":
      return (
        <div className="rounded-full bg-slate-500 w-10 aspect-square flex justify-center items-center">
          <DatabaseIcon className="stroke-white w-5 stroke-[1.5px]" />
        </div>
      );
    case "record":
      return (
        <div className="rounded-full bg-slate-500 w-10 aspect-square flex justify-center items-center">
          <FileSpreadsheetIcon className="stroke-white w-5 stroke-[1.5px]" />
        </div>
      );
    case "user":
      return (
        <div className="rounded-full bg-slate-500 w-10 aspect-square flex justify-center items-center">
          <UserIcon className="stroke-white w-5 stroke-[1.5px]" />
        </div>
      );

    default:
      return (
        <div className="rounded-full bg-slate-500 w-10 aspect-square flex justify-center items-center">
          <Settings2Icon className="stroke-white w-5 stroke-[1.5px]" />
        </div>
      );
  }
};

const NotiItem = ({ notiBody }: { notiBody: INotification }) => {
  return (
    <>
      <div className="grid grid-cols-[40px_1fr] group cursor-pointer hover:hover:bg-slate-100 rounded-lg pl-[3px] py-[10px]">
        <div className="type-icon">
          <NotiTypeIcon type={notiBody.notiType} />
        </div>
        <div className="text-section flex flex-col ml-3">
          <NotiBodyText text={notiBody.bodyText} />
          <NotiTime timeString={notiBody.createdAt} />
        </div>
      </div>
    </>
  );
};

function App() {
  const [userId, setuserId] = useState("");
  const [notiList, setNotiList] = useState<INotification[]>([]);

  const [notiBody, setBody] = useState("");

  useEffect(() => {
    if (userId) {
      socket.emit("all-notifications", +userId);
    }
  }, [userId]);

  useEffect(() => {
    socket.on("all-notifications", (data: INotification[]) => {
      setNotiList(data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("scoket-error", (data: { message: string }) => {
      console.log("data", data);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("new-notification", (data) => {
      setNotiList((oldArray) => [data, ...oldArray]);
    });
  }, [socket]);

  const publishNotification = (eventType) => {
    const data = {
      bodyText: notiBody,
      createdAt: moment().tz("Asia/Ho_Chi_Minh").toISOString(),
      notiType: eventType,
      publisherId: userId,
    };
    socket.emit("new-notification", data);
  };

  return (
    <>
      <Input
        value={userId}
        onChange={(e) => setuserId(e.target.value)}
        className="w-52 mt-10 ml-10"
      />

      <div className="ml-20 mr-20 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full"
            >
              <BellIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" asChild>
            <div className="w-80 pl-3 pr-0">
              <div className="flex justify-end mb-1 mr-2">
                <Button variant="link">All notifications</Button>
              </div>
              <hr className="solid" />
              <ScrollArea className="w-full h-[290px] mt-1">
                <div className="flex flex-col mr-3">
                  {notiList.map((x, index) => (
                    <NotiItem key={index} notiBody={x} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Input
        value={notiBody}
        onChange={(e) => setBody(e.target.value)}
        className="w-96 ml-10"
      />
      <div className="flex gap-3 ml-10 mt-5">
        <Button
          onClick={() => publishNotification("user")}
          className="bg-indigo-800"
        >
          Event User
        </Button>
        <Button
          onClick={() => publishNotification("permission")}
          className="bg-red-700"
        >
          Event Permission
        </Button>
        <Button
          onClick={() => publishNotification("database")}
          className="bg-green-800"
        >
          Event Database
        </Button>
        <Button
          onClick={() => publishNotification("record")}
          className="bg-yellow-700"
        >
          Event Record
        </Button>
      </div>
    </>
  );
}
export default App;
