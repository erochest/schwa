{-# LANGUAGE OverloadedStrings #-}


module Main where


import           Data.Monoid
import           System.Environment
import           Web.Spock.Safe


main :: IO ()
main = do
    [_, port] <- getArgs
    runSpock (read port) $ spockT id $ do
        get root $
            text "Hello World!"
        get ("hello" <//> var) $ \name ->
            text ("Hello " <> name <> "!")
