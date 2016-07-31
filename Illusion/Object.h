//
//  Object.h
//  Illusion
//
//  Created by Prabhat Godse on 3/29/15.
//  Copyright (c) 2015 biodigital. All rights reserved.
//

#ifndef __Illusion__Object__
#define __Illusion__Object__

#include <stdio.h>
#include <OpenGL/gl3.h>
#include <iostream>
#include "glm/fwd.hpp"
#include "glm/glm.hpp"

class Object {
public:
    GLuint shaderProgram;
    GLuint vertexBuffer;
    GLuint normalBuffer;
    GLuint uvsBuffer;
    int _polyCount;
    //Uniforms
    GLuint uniformMVP, uniformModelMat, uniformViewMat, uniformNormalMat, uniformLightMat,
    uniformBaseColor;
    
    GLuint dirVecUniform, dirColorUniform, texture0Uniform, depthTextureUniform;
    glm::mat4 _projMat, _projView, _viewMatrix, _normalMatrix, modelMatrix;
    glm::vec3 baseColor;
    GLuint texture0, depthTexture;
    
    void destroy();

    Object();
    Object(std::string vertexSource, std::string fragmentSource);
    
    void setProjectionViewMatrix(glm::mat4 projMat, glm::mat4 viewMat);
    
    GLuint depthFrameBuffer = 0;
    GLuint depthProgram = 0;
    GLuint depthQuadBuffer = 0;
    
    //Shadertype: standard :: uses regular color texture
    // depth:: renders to depth texture.
    
    virtual void drawObject();
    void drawObjectType(std::string type);
    void drawObjectDepth();
    
    void initGeometry();
    
};
#endif /* defined(__Illusion__Object__) */
