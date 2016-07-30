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

Object::Object(std::string vertexSource, std::string fragmentSource) {
    shaderProgram = LoadShaders(vertexSource.c_str(), fragmentSource.c_str());
    
    initGeometry();
    std::string texName = "moon.jpg";
    
    int width, height, channels;
    unsigned char *ht_map = SOIL_load_image
    (
     texName.c_str(),
     &width, &height, &channels,
     SOIL_LOAD_RGBA
     );
    
    cout << width << " " << height << endl;
    
    //Create texture reference
    glGenTextures(1, &texture0);
    
    glBindTexture(GL_TEXTURE_2D, texture0);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, ht_map);
    
    //It'sa good practice to unbind and dealloc textures.
    SOIL_free_image_data(ht_map);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Object::initGeometry() {
    _projView = glm::mat4(1.0);
    modelMatrix = glm::scale(modelMatrix, glm::vec3(0.5, .5, .5));
    
    GLuint vertexArrayId;
    glGenVertexArrays(1, &vertexArrayId);
    glBindVertexArray(vertexArrayId);
    
    std::vector<glm::vec3> vertices;
    std::vector<glm::vec2> uvs;
    std::vector<glm::vec3> normals; // Won't be used at the moment.
    bool res = loadOBJ("box.obj", vertices, uvs, normals);
    
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
    
    //Get uniform locations
    uniformMVP = glGetUniformLocation(shaderProgram, "MVP");
    uniformModelMat = glGetUniformLocation(shaderProgram, "modelMatrix");
    uniformViewMat = glGetUniformLocation(shaderProgram, "viewMatrix");
    
    uniformNormalMat = glGetUniformLocation(shaderProgram, "normalMatrix");
    dirColorUniform = glGetUniformLocation(shaderProgram, "dirLightColor");
    dirVecUniform = glGetUniformLocation(shaderProgram, "dirLightVec");
    
    texture0Uniform = glGetUniformLocation(shaderProgram, "myTexture");
}

void Object::destroy() {
    glDeleteBuffers(1, &vertexBuffer);
    glDeleteBuffers(1, &normalBuffer);
    glDeleteBuffers(1, &uvsBuffer);
    glDeleteProgram(shaderProgram);
}

void Object::setProjectionViewMatrix(glm::mat4 projMat, glm::mat4 viewMat) {
    _viewMatrix = viewMat;
    _projView = projMat * viewMat;
    _normalMatrix = glm::inverse(modelMatrix);
    _normalMatrix = glm::transpose(_normalMatrix);
}

glm::vec3 lightDir = glm::vec3(-1.0, 0.5, 0.3);
glm::vec3 lightColor = glm::vec3(0.4, 0.5, 0.6);

void Object::drawObject() {
    //Compute model matrix
    glm::mat4 modelViewMatrix = _projView * modelMatrix;
    
    //Use the shader
    glUseProgram(shaderProgram);
    glEnable(GL_DEPTH);
    
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
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture0);
    glUniform1i(texture0Uniform, 0);
    
    //Apply uniform variables
    glUniformMatrix4fv(uniformMVP, 1, GL_FALSE, &_projView[0][0]);
    glUniformMatrix4fv(uniformModelMat, 1, GL_FALSE, &modelMatrix[0][0]);
    glUniformMatrix4fv(uniformViewMat, 1, GL_FALSE, &_viewMatrix[0][0]);
    glUniformMatrix4fv(uniformNormalMat, 1, GL_FALSE, &_normalMatrix[0][0]);
    glUniform3f(dirColorUniform, lightColor.x, lightColor.y, lightColor.z);
    glUniform3f(dirVecUniform, lightDir.x, lightDir.y, lightDir.z);
    
    glDrawArrays(GL_TRIANGLES, 0, _polyCount);
    
    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glDisableVertexAttribArray(2);
    
}

//Draw geometry and associated textures
void Object::drawObjectType(std::string type) {
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
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture0);
    glUniform1i(texture0Uniform, 0);
    
    glDrawArrays(GL_TRIANGLES, 0, _polyCount);
    
    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glDisableVertexAttribArray(2);
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
