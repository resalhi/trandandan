// "use client";
// import "./chat.css";
// import React, { useEffect } from "react";
// import ChannalAndDirectMessage from "@/components/chat/channal&MessageList/channal&directMessage";
// import ChatContent from "@/components/chat/chatContent/chatContent";
// import AdminsMembers from "@/components/chat/adminMembers/adminMembers";

// import { useParams } from "next/navigation";
// import { fetchUser } from "@/services/userServices";
// import useSWR from "swr";
// import useUsernameStore from "@/store/usernameStore";


// export default function DirectMessage() {

//   const params = useParams();
//   const userId = params.id;
//   const { data: user, error } = useSWR(
//     `http://localhost:3001/user/${userId}`,
//     fetchUser
//   );



  
//   return (
//     <div className="chat-container">
//       <div className="flex h-full">
//         {/* <ChannalAndDirectMessage
//           user={user}
//         />
//         <ChatContent
//           user={user}
//         />
//         <AdminsMembers user={user} /> */}
//       </div>
//     </div>
//   );
// }
