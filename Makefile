default: deps format lint tst build

deps:
	go get -u golang.org/x/tools/cmd/goimports
	go get -u github.com/golang/lint/golint
	go get -u github.com/docker/docker/client
	go get -u github.com/docker/docker/api/types
	go get -u github.com/docker/docker/api/types/container
	go get -u github.com/docker/docker/api/types/filters
	go get -u github.com/docker/docker/api/types/network
	go get -u github.com/docker/docker/api/types/strslice
	go get -u github.com/docker/docker/api/types/swarm
	go get -u github.com/ViBiOh/httputils
	go get -u github.com/ViBiOh/httputils/cert
	go get -u github.com/ViBiOh/httputils/cors
	go get -u github.com/ViBiOh/httputils/owasp
	go get -u github.com/ViBiOh/httputils/prometheus
	go get -u github.com/ViBiOh/alcotest/alcotest
	go get -u github.com/gorilla/websocket
	go get -u gopkg.in/yaml.v2
	go get -u github.com/ViBiOh/auth
	go get -u github.com/ViBiOh/auth/bcrypt
	go get -u github.com/ViBiOh/viws

format:
	goimports -w **/*.go *.go
	gofmt -s -w **/*.go *.go

lint:
	golint ./...
	go vet ./...

tst:
	script/coverage

bench:
	go test ./... -bench . -benchmem -run Benchmark.*

build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -installsuffix nocgo -o bin/dashboard dashboard.go

start-auth:
	auth -tls=false -basicUsers "admin:`bcrypt admin`" -corsHeaders Content-Type,Authorization -port 1081

start-api:
	go run dashboard.go -tls=false -ws ".*" -dockerVersion '1.24' -authUrl http://localhost:1081 -users admin:admin -corsHeaders Content-Type,Authorization -corsMethods GET,POST,DELETE
