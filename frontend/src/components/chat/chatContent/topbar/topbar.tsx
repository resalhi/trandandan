import { useState } from "react";
import  {useIsDirectMessage}  from "@/store/userStore";
import useRecieverStore from "@/store/recieverStore";

export default function TopBar({user, username, channel} : {user:any, username: string, channel: string}){
    const [isComponentVisible, setIsComponentVisible] = useState(false);
    const {isDirectMessage, setIsDirectMessage} = useIsDirectMessage();
    const { reciever, setReciever } = useRecieverStore();


    return(
        <>
        <div className="border-b flex px-6 py-2 items-center justify-between flex-none ">
        {/* name of channal */}
        <div className="flex flex-col " >
          <h3 className=" mb-1 font-extrabold">
            <span className="text-xl font-bold opacity-50">#</span> {isDirectMessage ? reciever : channel}
          </h3>
        </div>

        {/* picture profile  */}
        
        <div className="ml-auto  lg:block" >
         
          <div className="relative">
            {/* megamenu profile */}
            <div className="absolute top-0 right-0  -mt-5 mr-2 flex items-center" >
              
              {/* <!-- drawer component --> */}
              <button
                onClick={() => setIsComponentVisible(!isComponentVisible)}
                className="cursor-pointer my-2"
                type="button"
              >
                
                <svg
                  className="w-5 h-5 text-white  cursor-pointer hover:text-gray-300  2xl:hidden"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 16"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                </svg>
              </button>

              {isComponentVisible && (
                <div className="sidemodelAM absolute h-screen -right-8 w-80 -top-1   bg-backgroundColorPrimery rounded-md shadow-lg border border-gray-700">
                  <button
                onClick={() => setIsComponentVisible(!isComponentVisible)}
                className="cursor-pointer my-2 ml-60 rounded-full bg-gray-700 text-white text-sm px-4 py-2
                "
                type="button"
              >
                close 
                </button>
                  <h3 className=" font-light text-white pl-10 py-10 opacity-50">
                    # Admins
                  </h3>
                  {/* icon is online   */}
                  {/* <span className="bg-green-400 rounded-full block w-2 h-2 absolute  ml-10 mt-1 "></span> */}
                  <span className="relative flex h-1 w-3 ml-10 mt-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                </span>
                  <div className="flex items-center  w-12 h-12 mr-2 ml-10">
                    <img
                      src={user?.avatarUrl}
                      alt=""
                      className="rounded-3xl"
                    />
                    <span className="text-white font-bold  opacity-90 ml-10">
                      {user?.username}
                    </span>
                  </div>

                  {/* members */}
                  <h3 className=" font-light text-white pl-10 py-10 opacity-50">
                    # Members
                  </h3>
                  {/* icon is online   */}
                  <span className="relative flex h-1 w-3 ml-10 mt-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  <div className="flex  items-center w-12 h-12 mr-2 ml-10">
                    <img
                      src={user?.avatarUrl}
                      alt=""
                      className="rounded-3xl"
                    />
                    <span className="text-white font-bold  opacity-90 ml-10">
                      {user?.username}
                    </span>
                    <button className="pl-14">
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
                          d="M15.8457 29.4531C16.8812 29.4531 17.7207 28.4388 17.7207 27.1875C17.7207 25.9362 16.8812 24.9219 15.8457 24.9219C14.8102 24.9219 13.9707 25.9362 13.9707 27.1875C13.9707 28.4388 14.8102 29.4531 15.8457 29.4531Z"
                          fill="#FFFEFE"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
    )
}