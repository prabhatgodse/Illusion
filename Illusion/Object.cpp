//
//  Object.cpp
//  Illusion
//
//  Created by Prabhat Godse on 3/29/15.
//  Copyright (c) 2015 biodigital. All rights reserved.
//

#include "Object.h"
#include "shader.hpp"
#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"
#include <iostream>
#include <vector>
#include "objloader.hpp"
#include "SOIL.h"

using namespace std;

Object::Object() {
    
}

Object::Object(GLuint shader) {
    shaderProgram = shader; //LoadShaders(vertexSource.c_str(), fragmentSource.c_str());
    baseColor = glm::vec4(0.5, 0.5, 0.5, 1.0);
    material = NULL;
    modelMatrix = glm::mat4(1.0);
}

glm::vec3 lightDir = glm::vec3(0.0, -3.5, -1.2);
glm::vec3 lightColor = glm::vec3(0.7, 0.65, 0.6);

void Object::initGeometry(std::string fileName) {
    objFile = fileName;
    _projView = glm::mat4(1.0);
    modelMatrix = glm::scale(modelMatrix, glm::vec3(0.4, .4, .4));
    
    GLuint vertexArrayId;
    glGenVertexArrays(1, &vertexArrayId);
    glBindVertexArray(vertexArrayId);
    
    std::vector<glm::vec3> vertices;
    std::vector<glm::vec2> uvs;
    std::vector<glm::vec3> normals; // Won't be used at the moment.
    bool res = loadOBJ(objFile.c_str(), vertices, uvs, normals);
    
    _polyCount = sizeof(vertices) / sizeof(GL_FLOAT);
    _polyCount = (int)vertices.size(); //For triangles
    
    //Load Vertices to VBO
    glGenBuffers(1, &vertexBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(glm::vec3), &vertices[0], GL_STATIC_DRAW);
    
    //Load Normals to VBO
    glGenBuffers(1, &normalBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, normalBuffer);
    glBufferData(GL_ARRAY_BUFFER, normals.size() * sizeof(glm::vec3), &normals[0], GL_STATIC_DRAW);
    
    //Load UVs
    glGenBuffers(1, &uvsBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, uvsBuffer);
    glBufferData(GL_ARRAY_BUFFER, uvs.size() * sizeof(glm::vec2), &uvs[0], GL_STATIC_DRAW);
    
    depthTextureUniform = glGetUniformLocation(shaderProgram, "depthTexture");
    
    if(material == NULL) {
        this->material = new Material(shaderProgram);
    }
    this->material->addUniform3fv("dirLightColor", lightColor);
    this->material->addUniform3fv("dirLightVec", lightDir);
    this->material->addUniform4f("baseColor", baseColor);
    
    //Create generic texture
    Texture *mainTex = new Texture("moon.jpg");
    this->material->addUniformTexture("myTexture", mainTex);
}

void Object::destroy() {
    glDeleteBuffers(1, &vertexBuffer);
    glDeleteBuffers(1, &normalBuffer);
    glDeleteBuffers(1, &uvsBuffer);
    glDeleteProgram(shaderProgram);
}

void Object::setProjectionViewMatrix(glm::mat4 projMat, glm::mat4 viewMat) {
    if(skybox) {
        _viewMatrix = glm::mat4(glm::mat3(viewMat));
    } else {
        _viewMatrix = viewMat;
    }
    _projMat = projMat;
    _projView = projMat * _viewMatrix;
    _normalMatrix = glm::transpose(glm::inverse(modelMatrix));
}



void Object::drawObject() {
    //Compute model matrix
    glm::mat4 modelViewMatrix = _projView * modelMatrix;
    
    glm::mat4 lightMat4 = glm::lookAt(lightDir, glm::vec3(0,0,0), glm::vec3(0,1,0));
    
    GLfloat near_plane = 0.1f, far_plane = 100.0f;
    glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);
    glm::mat4 viewInverseM = glm::inverse(_viewMatrix);
    
    lightMat4 = _projMat * lightMat4;
    
    this->material->addUniformMatrix4fv("MVP", _projView);
    this->material->addUniformMatrix4fv("modelMatrix", modelMatrix);
    if(!skybox) {
        this->material->addUniformMatrix4fv("uniformLightMat", lightMat4);
        this->material->addUniformMatrix4fv("viewMatrix", _viewMatrix);
        this->material->addUniformMatrix4fv("normalMatrix", _normalMatrix);
        this->material->addUniformMatrix4fv("viewInverseMat", viewInverseM);
    }
    //Use the shader
    glUseProgram(shaderProgram);
    
    if(blending) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE);
        glBlendEquation(GL_FUNC_ADD);
    } else {
        glDisable(GL_BLEND);
        glEnable(GL_DEPTH);
    }
    if(skybox) {
        glDepthFunc(GL_LEQUAL);
    }
    // 1st attribute buffers : vertex
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    // 2nd attribute buffers: normals
    glEnableVertexAttribArray(1);
    glBindBuffer(GL_ARRAY_BUFFER, normalBuffer);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    // 3rd attribute uvs
    glEnableVertexAttribArray(2);
    glBindBuffer(GL_ARRAY_BUFFER, uvsBuffer);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    this->material->applyMaterial();
    //Apply textures
//    glActiveTexture(GL_TEXTURE0);
//    glBindTexture(GL_TEXTURE_2D, texture0);
//    glUniform1i(texture0Uniform, 0);
    
    if(!skybox) {
        glActiveTexture(GL_TEXTURE1);
        glBindTexture(GL_TEXTURE_2D, depthTexture);
        glUniform1i(depthTextureUniform, 1);
    }
    
    glDrawArrays(GL_TRIANGLES, 0, _polyCount);
    
    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glDisableVertexAttribArray(2);
    
    if(skybox) {
        glDepthFunc(GL_LESS);
    }
}

//Draw geometry and associated textures
void Object::drawObjectType(std::string type) {
    if(skybox) return;
    
    glCullFace(GL_FRONT);
    // 1st attribute buffers : vertex
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    // 2nd attribute buffers: normals
    glEnableVertexAttribArray(1);
    glBindBuffer(GL_ARRAY_BUFFER, normalBuffer);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    // 3rd attribute uvs
    glEnableVertexAttribArray(2);
    glBindBuffer(GL_ARRAY_BUFFER, uvsBuffer);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    //Apply textures
//    glActiveTexture(GL_TEXTURE0);
//    glBindTexture(GL_TEXTURE_2D, texture0);
//    glUniform1i(texture0Uniform, 0);
    
    glDrawArrays(GL_TRIANGLES, 0, _polyCount);
    
    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glDisableVertexAttribArray(2);
    glCullFace(GL_BACK);
}

int W = 900;

void Object::drawObjectDepth() {
    if(depthFrameBuffer == 0) {
        //Create depth frame buffer
        glGenFramebuffers(1, &depthFrameBuffer);
        glBindFramebuffer(GL_FRAMEBUFFER, depthFrameBuffer);
        
        // Create a depth texture
        glGenTextures(1, &depthTexture);
        glBindTexture(GL_TEXTURE_2D, depthTexture);
        
        glTexImage2D(GL_TEXTURE_2D, 0,GL_DEPTH_COMPONENT16, W, W, 0, GL_DEPTH_COMPONENT, GL_FLOAT, 0);
//        glTexImage2D(GL_TEXTURE_2D, 0,GL_RGB, 900, 900, 0,GL_RGB, GL_UNSIGNED_BYTE, 0);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        
        glFramebufferTexture(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthTexture, 0);
//        glFramebufferTexture(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, depthTexture, 0);
        
        // Set the list of draw buffers.
//        GLenum DrawBuffers[1] = {GL_COLOR_ATTACHMENT0};
//        glDrawBuffers(1, DrawBuffers); // "1" is the size of DrawBuffers
        
        glDrawBuffer(GL_NONE); // No color buffer is drawn to.
        
        //Build a full screen quad
        GLuint quad_VertexArrayID;
        glGenVertexArrays(1, &quad_VertexArrayID);
        glBindVertexArray(quad_VertexArrayID);
        
        static const GLfloat g_quad_vertex_buffer_data[] = {
            -1.0f, -1.0f, 0.0f,
            1.0f, -1.0f, 0.0f,
            -1.0f,  1.0f, 0.0f,
            -1.0f,  1.0f, 0.0f,
            1.0f, -1.0f, 0.0f,
            1.0f,  1.0f, 0.0f,
        };
        
        glGenBuffers(1, &depthQuadBuffer);
        glBindBuffer(GL_ARRAY_BUFFER, depthQuadBuffer);
        glBufferData(GL_ARRAY_BUFFER, sizeof(g_quad_vertex_buffer_data), g_quad_vertex_buffer_data, GL_STATIC_DRAW);
        
        // Create and compile our GLSL program from the shaders
        depthProgram = LoadShaders( "DepthVertexShader.frag", "DepthFragmentShader.frag" );
        depthTextureUniform = glGetUniformLocation(depthProgram, "renderedTexture");
    }
    
    //Render scene to our framebuffer
    glBindFramebuffer(GL_FRAMEBUFFER, depthFrameBuffer);
    glViewport(0, 0, W, W);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    drawObject();
    
    //Render to screen
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glViewport(0, 0, W, W);
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    //Use quad program
    glUseProgram(depthProgram);
    
    //Bind the rendered texture
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, depthTexture);
    
    glUniform1i(depthTextureUniform, 0);
    
    //Enable the quad buffer
    glEnableVertexAttribArray(0);
    
    glBindBuffer(GL_ARRAY_BUFFER, depthQuadBuffer);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, (void*)0);
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray(0);
}
