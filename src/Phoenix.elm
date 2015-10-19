module Phoenix
  ( defaultSocketOptions
  , socket
  , connect
  , channel
  , join
  , push
  , on
  , Socket
  , Channel
  , SocketOptions
  , Transport(..)
  ) where

{-|

# Connecting
@docs socket, connect, channel, join, defaulSocketOptions, SocketOptions

# Sending and receiving
@docs push, on
-}

import Task
import Native.Phoenix

{-| Socket -}
type Socket = Socket
{-| Channel -}
type Channel = Channel

type alias Topic = String
type alias Event = String
type alias EndPoint = String

{-| A type representing the transport protocol between the client and server.
-}
type Transport
  = WebSocket
  | LongPoll

{-| Set optional parameters for the socket connection.
-}
type alias SocketOptions =
  { transport : Transport
  , heartbeatInterval : Int
  , reconnectAfter : Int
  , longpollerTimeout : Int
  }

{-| Default socket parameters. They are the same as specified in phoenix.js.
    { transport = WebSocket
    , heartbeatInterval = 30000
    , reconnectAfter = 10000
    , longpollerTimeout = 20000
    }
-}
defaultSocketOptions : SocketOptions
defaultSocketOptions =
  { transport = WebSocket
  , heartbeatInterval = 30000
  , reconnectAfter = 10000
  , longpollerTimeout = 20000
  }

{-| Initializes the socket. EndPoint is the websocket endpoint and can be given
with or whitout protocol and host.
  * "ws://example.com/ws"
  * "wss://example.com"
  * "/ws"
-}
socket : EndPoint -> SocketOptions -> Socket
socket = Native.Phoenix.socket

{-| Attempt to connect to the server.
 -}
connect : Socket -> Task.Task x Socket
connect = Native.Phoenix.connect

{-| Create a channel with a given topic over the socket.
-}
channel : Topic -> Socket -> Task.Task x Channel
channel = Native.Phoenix.channel

{-| Attempt to join the given channel. Messages sent by the server on a
successful join will be delivered to the specified address.
-}
join : Signal.Address String -> Channel -> Task.Task x Channel
join = Native.Phoenix.join

{-| Pushes a message over the channel to the server as event.
 -}
push : Event -> String -> Channel -> Task.Task x ()
push = Native.Phoenix.push

{-| Subscribes to event on the channel. Received messages will be delivered to
the specified address.
-}
on : Event -> Signal.Address String -> Channel -> Task.Task x ()
on = Native.Phoenix.on
