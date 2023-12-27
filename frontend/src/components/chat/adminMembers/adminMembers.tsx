"use client";
import { useIsDirectMessage } from "@/store/userStore";
import { use, useEffect, useState } from "react";
import socket from "@/services/socket";
import { useChannleIdStore } from "@/store/channelStore";


export default function AdminsMembers({ user }: { user: any }) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { channelId, setChannelId } = useChannleIdStore(); // channel id
  const [members, setMembers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [Setting, setSetting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ShowTimeMuted, setShowTimeMuted] = useState<boolean>(false);
  const [member, setMember] = useState<string>("");
  const [sender, setSender] = useState<string>("");
  const [justMemebre, setJustMemebre] = useState<boolean>(false);

  const listAdminsAndMembers = (channelId: string) => {
    setMembers([]);
    setAdmins([]);
    const username = user?.username;
    socket.emit("ChannelMembers", { channelId, username });
    socket.on("ChannelMembers", (data: any) => {
      data?.map((member: any) => {
        setMembers((members) => [...members, member?.user].filter((v, i, a) => a.findIndex(t => (t?.username === v?.username)) === i));
      });
    });

    // list all admins in the channel
    socket.emit("GetChannelAdmins", { channelId });
    socket.on("GetChannelAdmins", (data: any) => {
      for (let i = 0; i < data.length; i++) {
        setAdmins((admins) => [...admins, data[i]?.user].filter((v, i, a) => a.findIndex(t => (t?.username === v?.username)) === i));
      }
    });
  };

  // list all members in the channel
  useEffect(() => {
    if (channelId) {
      listAdminsAndMembers(channelId);
    }
    return () => {
      socket.off("ChannelMembers");
      socket.off("ChannelAdmins");
      socket.off("getUserById");
    }
  }, [channelId]);


  const makeAdmin = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("makeAdmin", { sender, member, channelId });
    socket.on("makeAdmin", (data: any) => {
      
      if (!data){
        alert("you are not the owner or admin of the channel");
        return;
      }else{
        alert("admin added");
      }
      setSetting(!Setting);
      listAdminsAndMembers(channelId);
    });
  }

  const kickMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("kickMember", { sender, member, channelId });
    socket.on("kickMember", (data: any) => {
      console.log("kick member: ", data);
      if (!data){
        alert("you are not the owner or admin of the channel");
        return;
      }
      else{
        alert("member kicked");
      }
      setSetting(!Setting);
    });
  }

  const BanMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("BanMember", { sender, member, channelId });
    socket.on("BanMember", (data: any) => {
      console.log("ban member: ", data);
      if (!data){
        alert("you can't ban the member");
        return;
      }else{
        alert("member banned");
      }
      setSetting(!Setting);

    });
  }

  const MuteMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);

    // Calculate the time when the mute will end
    const muteDuration = 20 * 1000; // 20 seconds
    // const unmuteTime = new Date().getTime() + muteDuration;

    let Muted = false;
    // Emit a socket event to the server to mute the member
    socket.emit("MuteMember", { sender, member, channelId,  Muted});
    socket.on("MuteMember", (data: any) => {
      console.log("1: ", data)
      if (data === "owner muted member") {
        setShowTimeMuted(!ShowTimeMuted);
      }
      else if (data === "admin muted member") {
        setShowTimeMuted(!ShowTimeMuted);
      }
      else{
        setJustMemebre(!justMemebre);
      }
    });
   
    // wait for time to end
    setTimeout(() => {
      Muted = true;
      socket.emit("MuteMember", { sender, member, channelId, Muted });
    }, muteDuration);

  };

  const close = () => {
    setSetting(!Setting);
    setShowTimeMuted(!ShowTimeMuted);
    setJustMemebre(false);
  }



  return (
    <div className="bg-slate-900  pr-40 mr-44 w-72 rounded-2xl hidden lg:block admin-div border border-gray-700">
      {!isDirectMessage ? (
        <>
          {/* admins */}
          <h3 className=" font-light text-white pl-8 py-10 opacity-50">
            # Admins
          </h3>
          {
            admins?.map((admin, index) => (
              <div key={admin?.username} className="flex items-center  relative ml-2 mr-2">
                <img src={admin?.avatarUrl} alt="" className="rounded-full h-14 ml-7 my-2 mr-2" />
                <span className="text-white font-bold  opacity-90 ml-2 mr-2">
                  {admin?.username}
                </span>
              </div>
            ))
          }
          {/* members */}
          <h3 className=" font-light text-white pl-8 py-10 opacity-50">
            # Members
          </h3>

          {
            members?.map((member, index) => (
              <div key={member?.username} className="ml-8 w-56">
                <div className="flex justify-between items-center w-full">
                  <img src={member?.avatarUrl} alt="" className="rounded-full h-14 ml-2 my-2 mr-2 " />
                  <span className="text-white font-bold  opacity-90" >
                    {member?.username}
                  </span>
                  <button className="border rounded-3xl text-sm p-1 ml-7 border-gray-700 hover:bg-gray-700"
                    onClick={() => setSetting(!Setting)}
                  >
                    <svg
                      width="31"
                      height="37"
                      viewBox="0 0 21 37"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.8457 11.3281C16.8812 11.3281 17.7207 10.3138 17.7207 9.06251C17.7207 7.81124 16.8812 6.79688 15.8457 6.79688C14.8102 6.79688 13.9707 7.81124 13.9707 9.06251C13.9707 10.3138 14.8102 11.3281 15.8457 11.3281Z"
                        fill="#FFFEFE"
                      />
                      <path
                        d="M15.8457 20.3906C16.8812 20.3906 17.7207 19.3763 17.7207 18.125C17.7207 16.8737 16.8812 15.8594 15.8457 15.8594C14.8102 15.8594 13.9707 16.8737 13.9707 18.125C13.9707 19.3763 14.8102 20.3906 15.8457 20.3906Z"
                        fill="#FFFEFE"
                      />
                      <path
                        d="M15.8457 29.4531C16.8812 29.4531 17.7207 28.4388 17.7207 27.1875C17.7207 25.9362 16.8812 24.9219 15.8457 24.9219C14.8102
                    24.9219 13.9707 25.9362 13.9707 27.1875C13.9707 28.4388 14.8102 29.4531 15.8457 29.4531Z"
                        fill="#FFFEFE"
                      />
                    </svg>
                  </button>
                </div>

                {
                  Setting && (
                    <div className="absolute top-0 left-[465px] right-0 bottom-0 bg-slate-800 w-[666px] h-[360px] rounded-lg flex flex-col items-center justify-center">
                      <button className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border border-gray-700 hover:bg-gray-700"
                        onClick={() => makeAdmin(member.username, channelId)}
                      >Make Admin</button>
                      <button className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                        onClick={() => kickMember(member.username, channelId)}
                      >Kick User</button>
                      <button className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                        onClick={() => BanMember(member.username, channelId)}
                      >Ban User</button>
                      <button className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                        onClick={() => MuteMember(member.username, channelId)}
                      >Mute User</button>
                      {
                        ShowTimeMuted && !justMemebre && (
                          <div className="flex flex-col items-center justify-center">
                            <h6 className="text-white font-thin text-xl"
                             >
                              <span className="text-red-500">User <span className="text-blue-400"> {member.username} </span>
                              is Muted <span className="text-blue-400"> for 1 minute</span>
                              </span>

                            </h6>
                            </div>
                        )
                      }
                      {
                        justMemebre && !ShowTimeMuted && (
                          <div className="flex flex-col items-center justify-center">
                            <h6 className="text-white font-thin text-xl"
                             >
                              <span className="text-red-500">You Can't Mute <span className="text-blue-400"> {member.username} </span>
                              </span>

                            </h6>
                            </div>
                        )
                      }
                      <button
                        className=" mr-70 border rounded-3xl text-sm p-1 max-w-20 border-gray-700 hover:bg-gray-700 "
                        onClick={() => close()}>close</button>
                    </div>
                  )
                }
              </div>
            ))
          }
        </>
      ) : (
        <hr />
      )}
    </div>
  );
}
