package docker

import (
	"flag"
	"fmt"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/client"
	"github.com/ViBiOh/dashboard/auth"
	"log"
	"os"
	"regexp"
)

const host = `DOCKER_HOST`
const version = `DOCKER_VERSION`

var hostCheck *regexp.Regexp
var docker *client.Client

func init() {
	websocketOrigin := flag.String(`ws`, `^dashboard`, `Allowed WebSocket Origin pattern`)
	flag.Parse()

	client, err := client.NewClient(os.Getenv(host), os.Getenv(version), nil, nil)
	if err != nil {
		log.Fatal(err)
	} else {
		docker = client
	}

	hostCheck = regexp.MustCompile(*websocketOrigin)
}

func labelFilters(filtersArgs *filters.Args, user *auth.User, appName *string) error {
	if appName != nil && *appName != `` && isMultiApp(user) {
		if _, err := filters.ParseFlag(`label=`+appLabel+`=`+*appName, *filtersArgs); err != nil {
			return fmt.Errorf(`Error while parsing label for user: %v`, err)
		}
	} else if !isAdmin(user) {
		if _, err := filters.ParseFlag(`label=`+ownerLabel+`=`+user.username, *filtersArgs); err != nil {
			return fmt.Errorf(`Error while parsing label for user: %v`, err)
		}
	}

	return nil
}

func eventFilters(filtersArgs *filters.Args) error {
	if _, err := filters.ParseFlag(`event=create`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=start`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=stop`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=restart`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=rename`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=update`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=destroy`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=die`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}
	if _, err := filters.ParseFlag(`event=kill`, *filtersArgs); err != nil {
		return fmt.Errorf(`Error while parsing label for user: %v`, err)
	}

	return nil
}
