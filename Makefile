default: deps fmt lint tst build

deps:
	go get -u golang.org/x/tools/cmd/goimports
	go get -u github.com/golang/lint/golint
	go get -u github.com/docker/docker/api/types
	go get -u github.com/docker/docker/api/types/container
	go get -u github.com/docker/docker/api/types/filters
	go get -u github.com/docker/docker/api/types/network
	go get -u github.com/docker/docker/api/types/strslice
	go get -u github.com/docker/docker/api/types/swarm
	go get -u github.com/ViBiOh/alcotest/alcotest
	go get -u github.com/docker/docker/client
	go get -u github.com/gorilla/websocket
	go get -u golang.org/x/crypto/bcrypt
	go get -u golang.org/x/oauth2
	go get -u golang.org/x/oauth2/github
	go get -u gopkg.in/yaml.v2

fmt:
	goimports -w **/*.go *.go
	gofmt -s -w **/*.go *.go

lint:
	golint ./...
	go vet ./...

tst:
	script/coverage

build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -installsuffix nocgo -o bin/dashboard dashboard.go
	CGO_ENABLED=0 go build -ldflags="-s -w" -installsuffix nocgo -o bin/bcrypt bcrypt/bcrypt.go
	CGO_ENABLED=0 go build -ldflags="-s -w" -installsuffix nocgo -o bin/auth oauth/oauth.go
