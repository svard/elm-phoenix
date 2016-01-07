module Phoenix
  ( defaultSocketOptions
  , socket
  , connect
  , channel
  , join
  , leave
  , push
  , on
  , off
  , joinChannel
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

import Task exposing (Task, andThen)
import Native.Phoenix

{-| Socket -}
type Socket = Socket

{-| Channel, Phoenix bidirectional communication abstraction.
  * all messages received over this channel will be delivered to the specified Address
  * no operations are supported directly on the NativeChannel -}
type alias Channel =
  { address : Signal.Address String
  , chan : NativeChannel
  }

type NativeChannel = NativeChannel
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
connect : Socket -> Task x Socket
connect = Native.Phoenix.connect

{-| Create a channel with a given topic over the socket. All messages received over
this channel will be delivered to the specified address.
-}
channel : Topic -> Signal.Address String -> Socket -> Task x Channel
channel = Native.Phoenix.channel

{-| Attempt to join the given channel.
-}
join : Channel -> Task x Channel
join = Native.Phoenix.join

{-| Leaves the given channel.
-}
leave : Channel -> Task x ()
leave = Native.Phoenix.leave

{-| Pushes a message over the channel to the server as event.
 -}
push : Event -> String -> Channel -> Task x ()
push = Native.Phoenix.push

{-| Subscribes to event on the channel.
-}
on : Event -> Channel -> Task x ()
on = Native.Phoenix.on

{-| Unsubscribes to event on the channel.
-}
off : Event -> Channel -> Task x ()
off = Native.Phoenix.off

{-| Utility function. Connects to the server, creates a channel and joins a topic on the created channel.
-}
joinChannel : Socket -> Topic -> Signal.Address String -> Task x Channel
joinChannel socket topic address =
  connect socket 
    `andThen` channel topic address 
    `andThen` join
