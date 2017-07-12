package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/ViBiOh/dashboard/auth"
	"github.com/ViBiOh/dashboard/docker"
)

const port = `1080`
const gracefulCloseDelay = 30
const restPrefix = `/`
const websocketPrefix = `/ws/`

var restHandler = http.StripPrefix(restPrefix, docker.Handler{})
var websocketHandler = http.StripPrefix(websocketPrefix, docker.WebsocketHandler{})

var wg sync.WaitGroup

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	if strings.HasPrefix(r.URL.Path, websocketPrefix) {
		websocketHandler.ServeHTTP(w, r)
	} else if strings.HasPrefix(r.URL.Path, restPrefix) {
		restHandler.ServeHTTP(w, r)
	} else {
		w.WriteHeader(http.StatusNotFound)
	}
}

func handleGracefulClose(server *http.Server) {
	defer wg.Done()

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, syscall.SIGTERM)

	<-signals

	docker.GracefulClose = true

	log.Printf(`SIGTERM received, waiting %d seconds for load-balancer to be notify`, gracefulCloseDelay)
	time.Sleep(gracefulCloseDelay * time.Second)

	if server != nil {
		log.Print(`Shutting down http server`)
		if err := server.Shutdown(context.Background()); err != nil {
			log.Print(err)
		}
	}

	if docker.CanBeGracefullyClosed() {
		os.Exit(0)
	}

	ticker := time.Tick(10 * time.Second)
	timeout := time.After(2 * time.Minute)

	for {
		select {
		case <-ticker:
			if docker.CanBeGracefullyClosed() {
				os.Exit(0)
			}
		case <-timeout:
			os.Exit(1)
		}
	}
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())

	authFile := flag.String(`auth`, ``, `Path of authentification configuration file`)
	websocketOrigin := flag.String(`ws`, `^dashboard`, `Allowed WebSocket Origin pattern`)
	flag.Parse()

	auth.Init(*authFile)
	docker.Init(*websocketOrigin)

	log.Print(`Starting server on port ` + port)

	server := &http.Server{
		Addr:    `:` + port,
		Handler: http.HandlerFunc(dashboardHandler),
	}

	go handleGracefulClose(server)
	wg.Add(1)
	server.ListenAndServe()

	wg.Wait()
}
