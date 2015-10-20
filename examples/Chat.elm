module Chat where

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import StartApp
import Effects exposing (Effects, Never)
import Task exposing (Task, andThen)
import Json.Decode as Decode exposing ((:=))
import Json.Encode as Encode

import Phoenix

type alias Message =
  { body : String }

type alias Model =
  { receivedMsgs : List Message
  , outgoingMsg : String
  }

type Action
  = NewMsg (Maybe Message)
  | Update String
  | PushMsg

app =
  StartApp.start
    { init = init
    , update = update
    , view = view
    , inputs = [ incoming ]
    }

main =
  app.html

update : Action -> Model -> (Model, Effects Action)
update action model =
  case action of
    NewMsg maybeMsg ->
      case maybeMsg of
        Just msg ->
          ( { model | receivedMsgs <- msg :: model.receivedMsgs }
          , Effects.none
          )

        Nothing ->
          (model, Effects.none)

    Update str ->
      ( { model | outgoingMsg <- str }
      , Effects.none
      )

    PushMsg ->
      ( model
      , push (Message model.outgoingMsg)
      )

view : Signal.Address Action -> Model -> Html
view address model =
  div 
  []
  [ input 
    [ value model.outgoingMsg 
    , on "input" targetValue (Signal.message address << Update)
    , onEnter address PushMsg
    ]
    []
  , div
    []
    (List.map messageView (List.reverse model.receivedMsgs))
  ]

messageView : Message -> Html
messageView {body} =
  p
  []
  [ text body ]

  
init : (Model, Effects Action)
init =
  ( { receivedMsgs = []
    , outgoingMsg = ""
    }
  , Effects.none
  )

onEnter : Signal.Address a -> a -> Attribute
onEnter address value =
    on "keydown"
      (Decode.customDecoder keyCode is13)
      (\_ -> Signal.message address value)

is13 : Int -> Result String ()
is13 code =
  if code == 13 then Ok () else Err "not the right key code"

event : String
event = "new_msg"

topic : String
topic = "rooms:lobby"

connect : Task x Phoenix.Socket
connect =
  Phoenix.socket "/socket" Phoenix.defaultSocketOptions
    |> Phoenix.connect

join : Signal.Address String -> Phoenix.Socket -> Task x Phoenix.Channel
join address socket =
  Phoenix.channel topic socket `andThen` Phoenix.join address

joinChannel : Signal.Address String -> Task x Phoenix.Channel
joinChannel address =
  connect `andThen` join address

channel : Task x Phoenix.Channel
channel =
  connect `andThen` Phoenix.channel topic

push : Message -> Effects Action
push msg =
  channel `andThen` Phoenix.push event (encodeMessage msg)
    |> Task.map (always <| Update "")
    |> Effects.task

decodeMessage : String -> Result String Message
decodeMessage =
  Decode.decodeString <| Decode.object1 Message
          ("body" := Decode.string)

encodeMessage : Message -> String
encodeMessage {body} =
  Encode.encode 0 <| Encode.object
          [ ("body", Encode.string body) ]


mailbox : Signal.Mailbox String
mailbox = 
  Signal.mailbox ""

incoming : Signal Action
incoming = 
  mailbox.signal
    |> Signal.map (decodeMessage >> Result.toMaybe >> NewMsg)

port subscribe : Task x ()
port subscribe =
  joinChannel mailbox.address `andThen` Phoenix.on event mailbox.address

port tasks : Signal (Task Never ())
port tasks =
  app.tasks
