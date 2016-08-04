//
//  Material.cpp
//  Illusion
//
//  Created by Prabhat Godse on 8/4/16.
//  Copyright © 2016 biodigital. All rights reserved.
//

#include "Material.h"

Material::Material(GLuint shader) {
    shaderLocation = shader;
}

void Material::addUniform3f(std::string name, glm::vec3 vec3) {
    if(uniform3fMap.find(name) != uniform3fMap.end()) {
        //Uniform already encoded.
        //Update the existing value
        uniform3fMap[name].first = vec3;
    }
    else {
        //Find uniform in shader
        GLuint uniLocation = glGetUniformLocation(shaderLocation, name.c_str());
        if(uniLocation == -1) {
            std::cout << "Uniform3f not found: " << name << std::endl;
            return;
        }
        
        Uniform3fPair p(vec3, uniLocation);
        uniform3fMap[name] = p;
    }
}

void Material::addUniform3fv(std::string name, glm::vec3 vec3) {
    if(uniform3fvMap.find(name) != uniform3fvMap.end()) {
        //Uniform already encoded.
        //Update the existing value
        uniform3fvMap[name].first = vec3;
    }
    else {
        //Find uniform in shader
        GLuint uniLocation = glGetUniformLocation(shaderLocation, name.c_str());
        if(uniLocation == -1) {
            std::cout << "Uniform3fv not found: " << name << std::endl;
            return;
        }
        
        Uniform3fvPair p(vec3, uniLocation);
        uniform3fvMap[name] = p;
    }
}

void Material::addUniform4f(std::string name, glm::vec4 vec4) {
    if(uniform4fMap.find(name) != uniform4fMap.end()) {
        //Uniform already encoded.
        //Update the existing value
        uniform4fMap[name].first = vec4;
    }
    else {
        //Find uniform in shader
        GLuint uniLocation = glGetUniformLocation(shaderLocation, name.c_str());
        if(uniLocation == -1) {
            std::cout << "Uniform4f not found: " << name << std::endl;
            return;
        }
        
        Uniform4fPair p(vec4, uniLocation);
        uniform4fMap[name] = p;
    }
}

void Material::applyMaterial() {
    //TODO: Apply use program.
    for(auto const &itr : uniform3fMap) {
        Uniform3fPair pair = itr.second;
        glUniform3f(pair.second, pair.first.x, pair.first.y, pair.first.z);
    }
    
    for(auto const &itr : uniform3fvMap) {
        Uniform3fPair pair = itr.second;
        glUniform3fv(pair.second, 1, &pair.first[0]);
    }
    
    for(auto const &itr : uniform4fMap) {
        Uniform4fPair pair = itr.second;
        glUniform4f(pair.second, pair.first.x, pair.first.y, pair.first.z, pair.first.w);
    }
}