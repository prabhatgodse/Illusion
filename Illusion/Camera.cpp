//
//  Camera.cpp
//  Illusion
//
//  Created by Prabhat Godse on 3/29/15.
//  Copyright (c) 2015 biodigital. All rights reserved.
//

#include "Camera.h"
#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"
#include "glm/gtx/quaternion.hpp"

Camera::Camera(CameraType type, float width, float height) {
    _type = type;
    eyeZ = -5.0;
    _eyePosition = glm::vec3(0, 0, eyeZ);
    _orbitSpeed = 0.2;
    cameraRotation = glm::mat4();
    initMatrix(width, height);
}
void Camera::destroy() {
    //TODO:: destroy objects.
    sceneObjects.clear();
}

void Camera::initMatrix(float width, float height) {
    _width = width; _height = height;
    projectionMatrix = glm::perspective(45.0f, width / height, 0.1f, 100.0f);
    viewMatrix = glm::lookAt(_eyePosition,
                             glm::vec3(0, 0, 0),
                             glm::vec3(0, 1, 0));
    glm::quat a;
}

void Camera::mouseEvent(int button, int state, int x, int y) {
    if(button == 3) {
        eyeZ += 0.5;
    } else if(button == 4) {
        eyeZ -= 0.5;
    }else {
        _prevX = x; _prevY = y;
    }
}

void Camera::keyboardEvent(unsigned char c, int a, int b) {
    if (c == 'a' || c=='A') {
        eyeZ += 0.5;
    } else if (c == 'z' || c == 'Z') {
        eyeZ -= 0.5;
    }
    mouseMove(_prevX, _prevY);
}

double degToRad(double deg) {
    return  deg * M_PI / 180.0;
}

void Camera::mouseMove(int x, int y) {
    float _horizontalAngle = _orbitSpeed * (degToRad(x - _prevX));
    float _verticalAngle = _orbitSpeed * (degToRad(y - _prevY));
    _prevX = x;
    _prevY = y;
    
    viewMatrix = glm::mat4();
    viewMatrix = glm::translate(viewMatrix, glm::vec3(0, 0, eyeZ));
    
    glm::mat4 newRotation = glm::mat4();
    newRotation = glm::rotate(newRotation, _horizontalAngle, glm::vec3(0, 1, 0));
    newRotation = glm::rotate(newRotation, _verticalAngle, glm::vec3(1, 0, 0));
    cameraRotation = newRotation * cameraRotation;
    
    viewMatrix = viewMatrix * cameraRotation;
}

void Camera::addObject(Object *obj) {
    sceneObjects.push_back(obj);
}

void Camera::renderCamera() {
    glViewport(0, 0, _width, _height);
    std::vector<Object*>::iterator itr = sceneObjects.begin();
    while (itr < sceneObjects.end()) {
        (*itr)->setProjectionViewMatrix(projectionMatrix, viewMatrix);
        (*itr)->drawObjectDepth();
        itr++;
    }
    
//    glViewport(0, 0, _width/2, _height/2);
//    itr = sceneObjects.begin();
//    while (itr < sceneObjects.end()) {
//        (*itr)->setProjectionViewMatrix(projectionMatrix, viewMatrix);
//        (*itr)->drawObject();
//        itr++;
//    }
}