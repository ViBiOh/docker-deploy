package docker

import (
	"context"
	"fmt"
	"github.com/ViBiOh/docker-deploy/jsonHttp"
	"github.com/docker/docker/api/types"
	"io"
	"io/ioutil"
	"net/http"
)

const ownerLabel = `owner`
const appLabel = `app`

type results struct {
	Results interface{} `json:"results"`
}

func listContainers(loggedUser *user, appName *string) ([]types.Container, error) {
	options := types.ContainerListOptions{All: true}

	if filters, err := labelFilter(loggedUser, appName); err == nil {
		options.Filters = filters
	} else {
		return nil, err
	}

	return docker.ContainerList(context.Background(), options)
}

func inspectContainer(containerID string) (types.ContainerJSON, error) {
	return docker.ContainerInspect(context.Background(), containerID)
}

func startContainer(containerID string) error {
	return docker.ContainerStart(context.Background(), string(containerID), types.ContainerStartOptions{})
}

func stopContainer(containerID string) error {
	return docker.ContainerStop(context.Background(), containerID, nil)
}

func restartContainer(containerID string) error {
	return docker.ContainerRestart(context.Background(), containerID, nil)
}

func rmContainer(containerID string) error {
	container, err := inspectContainer(containerID)
	if err != nil {
		return fmt.Errorf(`Error while inspecting containers: %v`, err)
	}

	err = docker.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{RemoveVolumes: true, Force: true})
	if err != nil {
		return fmt.Errorf(`Error while removing containers: %v`, err)
	}

	return rmImages(container.Image)
}

func rmImages(imageID string) error {
	_, err := docker.ImageRemove(context.Background(), imageID, types.ImageRemoveOptions{})

	return err
}

func inspectContainerHandler(w http.ResponseWriter, containerID []byte) {
	if container, err := inspectContainer(string(containerID)); err != nil {
		errorHandler(w, err)
	} else {
		jsonHttp.ResponseJSON(w, container)
	}
}

func basicActionHandler(w http.ResponseWriter, loggedUser *user, containerID []byte, handle func(string) error) {
	id := string(containerID)

	allowed, err := isAllowed(loggedUser, id)
	if !allowed {
		forbidden(w)
	} else if err != nil {
		errorHandler(w, err)
	} else {
		if err = handle(id); err != nil {
			errorHandler(w, err)
		} else {
			w.Write(nil)
		}
	}
}

func listContainersHandler(w http.ResponseWriter, loggerUser *user) {
	if containers, err := listContainers(loggerUser, nil); err != nil {
		errorHandler(w, err)
	} else {
		jsonHttp.ResponseJSON(w, results{containers})
	}
}

func readBody(body io.ReadCloser) ([]byte, error) {
	defer body.Close()
	return ioutil.ReadAll(body)
}
