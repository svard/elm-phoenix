module Phoenix (socket, connect, channel, join, push, on, Socket, Channel) where

import Task
import Native.Phoenix

type Socket = Socket
type Channel = Channel

socket : String -> Socket
socket Native.Phoenix.socket

connect : Socket -> Task.Task x Socket
connect = Native.Phoenix.connect

channel : String -> Socket -> Channel
channel = Native.Phoenix.channel

join : Channel -> Task.Task x ()
join = Native.Phoenix.join

push : String -> String -> Channel -> Task.Task x ()
push = Native.Phoenix.push

on : String -> Signal.Address String -> Channel -> Task.Task x ()
on = Native.Phoenix.on
