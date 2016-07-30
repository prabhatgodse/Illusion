//
//  main.cpp
//  Illusion
//
//  Created by Prabhat Godse on 3/28/15.
//  Copyright (c) 2015 biodigital. All rights reserved.
//

#include <iostream>
#include <stdlib.h>
#include <math.h>
#include <GLUT/glut.h>
#include "Object.h"
#include "Camera.h"
#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"

Camera *camera;

void display()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    camera->renderCamera();
    glFlush();
}

void motionFunction(int x, int y) {
    camera->mouseMove(x, y);
    glutPostRedisplay();
}

void mouseEvent(int button, int state, int x, int y) {
    camera->mouseEvent(button, state, x, y);
    glutPostRedisplay();
}

void keyboard(unsigned char c, int a, int b) {
    camera->keyboardEvent(c, a, b);
    glutPostRedisplay();
}

void myinit() {
    Object *object = new Object("SimpleVertexShader.frag", "SimpleFragmentShader.frag");
    object->modelMatrix = glm::translate(object->modelMatrix, glm::vec3(3.0, 0.0, 0.0));
    camera->addObject(object);
    
//    Object *object2 = new Object("SimpleVertexShader.frag", "SimpleFragmentShader.frag");
//    object2->modelMatrix = glm::translate(object2->modelMatrix, glm::vec3(3.0, 0.0, 0.0));
//    camera->addObject(object2);
    
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glClearColor(0.4, 1.0, 1.0, 1.0);
}

void window2() {
    
}

int main(int argc, char** argv)
{
    int W = 900, H = 900;
    
    glutInit(&argc, argv);
    
    glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE | GLUT_DEPTH | GLUT_3_2_CORE_PROFILE);
    
    glutInitWindowSize(W, H);
    glutInitWindowPosition(0, 0);
    glutCreateWindow("GLUT Program");
    
    camera = new Camera(CAMERA_ORBIT, W, H);
    
    glutDisplayFunc(display);
    
    //Mouse events
    glutMotionFunc(motionFunction);
    glutMouseFunc(mouseEvent);
    glutKeyboardFunc(keyboard);
    
    myinit();
    glutMainLoop();
    return 0;
}