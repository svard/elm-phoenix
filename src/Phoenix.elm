module Phoenix 
  ( defaultSocketParams
  , socket
  , connect
  , channel
  , join
  , push
  , on
  , Socket
  , Channel
  , Transport
  , SocketParams
  , Transport(..)
  ) where

{-| Docs 
@docs Socket, Channel, socket, channel, connect, join, push, on 
-}

import Task
import Native.Phoenix

{-| Socket -}
type Socket = Socket
{-| Channel -}
type Channel = Channel

type Transport
  = WebSocket
  | LongPoll

{-| SocketParams -}
type alias SocketParams =
  { transport : Transport
  , heartbeatInterval : Int
  , reconnectAfter : Int
  , longpollerTimeout : Int
  }

{-| defaultsocketparams -}
defaultSocketParams : SocketParams
defaultSocketParams = 
  { transport = WebSocket
  , heartbeatInterval = 30000
  , reconnectAfter = 10000
  , longpollerTimeout = 20000
  }

{-| socket -}
socket : String -> SocketParams -> Socket
socket = Native.Phoenix.socket

{-| connect -}
connect : Socket -> Task.Task x Socket
connect = Native.Phoenix.connect

{-| channel -}
channel : String -> Socket -> Task.Task x Channel
channel = Native.Phoenix.channel

{-| join -}
join : Signal.Address String -> Channel -> Task.Task x Channel
join = Native.Phoenix.join

{-| push -}
push : String -> String -> Channel -> Task.Task x ()
push = Native.Phoenix.push

{-| on -}
on : String -> Signal.Address String -> Channel -> Task.Task x ()
on = Native.Phoenix.on
