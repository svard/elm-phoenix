module Phoenix (socket, connect, channel, join, push, on, Socket, Channel) where

{-| Docs 
@docs Socket, Channel, socket, channel, connect, join, push, on 
-}

import Task
import Native.Phoenix

{-| Socket -}
type Socket = Socket
{-| Channel -}
type Channel = Channel

{-| socket -}
socket : String -> Socket
socket = Native.Phoenix.socket

{-| connect -}
connect : Socket -> Task.Task x Socket
connect = Native.Phoenix.connect

{-| channel -}
channel : String -> Socket -> Channel
channel = Native.Phoenix.channel

{-| join -}
join : Channel -> Task.Task x Channel
join = Native.Phoenix.join

{-| push -}
push : String -> String -> Channel -> Task.Task x ()
push = Native.Phoenix.push

{-| on -}
on : String -> Signal.Address String -> Channel -> Task.Task x ()
on = Native.Phoenix.on
