//
//  Texture.cpp
//  Illusion
//
//  Created by Prabhat Godse on 8/5/16.
//  Copyright © 2016 biodigital. All rights reserved.
//

#include "Texture.hpp"
#include <string>
#include "SOIL.h"
#include <iostream>

Texture::Texture(std::vector<std::string> cubeList) {
    glGenTextures(1, &textureId);
    glBindTexture(GL_TEXTURE_CUBE_MAP, textureId);
    
    int width, height, channels;
    int i = 0;
    for(std::string cube : cubeList) {
        
        unsigned char *cubeBuffer = SOIL_load_image
        (
         cube.c_str(),
         &width, &height, &channels,
         SOIL_LOAD_RGBA
         );
        glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + 1, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, cubeBuffer);
        i++;
        SOIL_free_image_data(cubeBuffer);
    }
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
    glBindTexture(GL_TEXTURE_CUBE_MAP, 0);
    type = CUBE_MAP;
}

Texture::Texture(std::string path) {
    int width, height, channels;
    unsigned char *ht_map = SOIL_load_image
    (
     path.c_str(),
     &width, &height, &channels,
     SOIL_LOAD_RGBA
     );
    
    std::cout << width << " " << height << std::endl;
    
    //Create texture reference
    glGenTextures(1, &textureId);
    
    glBindTexture(GL_TEXTURE_2D, textureId);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, ht_map);
    
    //It'sa good practice to unbind and dealloc textures.
    SOIL_free_image_data(ht_map);
    glBindTexture(GL_TEXTURE_2D, 0);
    
    type = BASE_COLOR;
}