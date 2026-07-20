package com.proctor.service;

import com.proctor.dto.UserDto;
import com.proctor.entity.Resume;
import com.proctor.entity.User;
import com.proctor.mapper.ProctorMapper;
import com.proctor.repository.ResumeRepository;
import com.proctor.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ProctorMapper mapper;

    @Mock
    private jakarta.persistence.EntityManager entityManager;

    @Mock
    private jakarta.persistence.TypedQuery<Long> typedQueryLong;

    @Mock
    private jakarta.persistence.Query query;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDto userDto;
    private Resume resume;

    @BeforeEach
    public void setUp() {
        ReflectionTestUtils.setField(userService, "resumeUploadDir", "./target/test-resumes");

        user = User.builder()
                .id(1L)
                .email("candidate@email.com")
                .firstName("Jane")
                .lastName("Doe")
                .isEnabled(true)
                .build();

        userDto = new UserDto();
        userDto.setId(1L);
        userDto.setEmail("candidate@email.com");
        userDto.setFirstName("Jane");
        userDto.setLastName("Doe");

        resume = Resume.builder()
                .id(10L)
                .user(user)
                .fileName("cv.pdf")
                .filePath("./target/test-resumes/cv.pdf")
                .fileSize(1024L)
                .parsedText("Parsed resume text")
                .build();
    }

    @Test
    public void testGetAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(Collections.singletonList(user));
        when(mapper.toDto(user)).thenReturn(userDto);

        List<UserDto> results = userService.getAllUsers();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("candidate@email.com", results.get(0).getEmail());
    }

    @Test
    public void testGetUserByEmail_Success() {
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(user));
        when(mapper.toDto(user)).thenReturn(userDto);

        UserDto result = userService.getUserByEmail("candidate@email.com");

        assertNotNull(result);
        assertEquals("candidate@email.com", result.getEmail());
    }

    @Test
    public void testUpdateUserProfile_Success() {
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(mapper.toDto(user)).thenReturn(userDto);

        UserDto updatedDto = new UserDto();
        updatedDto.setFirstName("Janet");
        updatedDto.setLastName("Smith");

        UserDto result = userService.updateUserProfile("candidate@email.com", updatedDto);

        assertNotNull(result);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    public void testDeleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // Mock simple Query creation & execution
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);
        
        // Mock TypedQuery<Long> creation & execution
        when(entityManager.createQuery(anyString(), eq(Long.class))).thenReturn(typedQueryLong);
        when(typedQueryLong.setParameter(anyString(), any())).thenReturn(typedQueryLong);
        when(typedQueryLong.getResultList()).thenReturn(Collections.emptyList());
        
        // Mock Native Query creation & execution
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);

        userService.deleteUser(1L);

        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    public void testSaveUserResume_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume_jane_doe.txt",
                "text/plain",
                "Mock CV Content".getBytes()
        );

        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(resumeRepository.save(any(Resume.class))).thenReturn(resume);

        userService.saveUserResume("candidate@email.com", file);

        verify(resumeRepository, times(1)).save(any(Resume.class));
    }

    @Test
    public void testGetResumeByEmail_Success() {
        when(userRepository.findByEmail("candidate@email.com")).thenReturn(Optional.of(user));
        when(resumeRepository.findByUserId(1L)).thenReturn(Optional.of(resume));

        Resume result = userService.getResumeByEmail("candidate@email.com");

        assertNotNull(result);
        assertEquals("cv.pdf", result.getFileName());
    }
}
