package docker

import (
	"flag"
	"fmt"

	"github.com/ViBiOh/dashboard/auth"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
)

const ownerLabel = `owner`
const appLabel = `app`

var docker *client.Client

var (
	dockerHost    = flag.String(`dockerHost`, `unix:///var/run/docker.sock`, `Docker Host`)
	dockerVersion = flag.String(`dockerVersion`, ``, `Docker API Version`)
)

// Init docker client
func Init() error {
	client, err := client.NewClient(*dockerHost, *dockerVersion, nil, nil)
	if err != nil {
		return fmt.Errorf(`Error while creating docker client: %v`, err)
	}
	docker = client

	if err := InitWebsocket(); err != nil {
		return fmt.Errorf(`Error while initializing websocket: %v`, err)
	}

	return nil
}

func labelFilters(user *auth.User, filtersArgs *filters.Args, appName string) {
	if appName != `` && isMultiApp(user) {
		filtersArgs.Add(`label`, appLabel+`=`+appName)
	} else if !isAdmin(user) {
		filtersArgs.Add(`label`, ownerLabel+`=`+user.Username)
	}
}

func healthyStatusFilters(filtersArgs *filters.Args, containersIds []string) {
	filtersArgs.Add(`event`, `health_status: healthy`)

	for _, container := range containersIds {
		filtersArgs.Add(`container`, container)
	}
}

func eventFilters(filtersArgs *filters.Args) {
	filtersArgs.Add(`event`, `create`)
	filtersArgs.Add(`event`, `start`)
	filtersArgs.Add(`event`, `stop`)
	filtersArgs.Add(`event`, `restart`)
	filtersArgs.Add(`event`, `rename`)
	filtersArgs.Add(`event`, `update`)
	filtersArgs.Add(`event`, `destroy`)
	filtersArgs.Add(`event`, `die`)
	filtersArgs.Add(`event`, `kill`)
}
