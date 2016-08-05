//
//  Material.hpp
//  Illusion
//
//  Created by Prabhat Godse on 8/4/16.
//  Copyright © 2016 biodigital. All rights reserved.
//


#include <stdio.h>
#include <OpenGL/gl3.h>
#include <string>
#include <iostream>
#include <map>
#include "glm/glm.hpp"
#include "Texture.hpp"

class Material {
public:
    Material(GLuint shader);
    
    //GL location of shader on GPU
    GLuint shaderLocation;
    
    typedef std::pair <glm::vec3, GLuint> Uniform3fPair;
    std::map<std::string, Uniform3fPair> uniform3fMap;
    void addUniform3f(std::string name, glm::vec3 vec3);
    
    typedef std::pair <glm::vec3, GLuint> Uniform3fvPair;
    std::map<std::string, Uniform3fvPair> uniform3fvMap;
    void addUniform3fv(std::string name, glm::vec3 vec3);
    
    typedef std::pair <glm::vec4, GLuint> Uniform4fPair;
    std::map<std::string, Uniform4fPair> uniform4fMap;
    void addUniform4f(std::string name, glm::vec4 vec4);
    
    //Pair the texture to uniform location on shader program
    typedef std::pair<Texture*, GLuint> UniformTexturePair;
    std::map<std::string, UniformTexturePair> uniformTextureMap;
    void addUniformTexture(std::string name, Texture *texture);
    
    void applyMaterial();
};