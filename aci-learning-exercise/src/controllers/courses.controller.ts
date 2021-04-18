import { inject } from '@loopback/core';
import {
  Filter,
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  HttpErrors,
  put,
  del,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import {Course} from '../models';
import {CourseRepository} from '../repositories';

export class CoursesController {
  constructor(
    @repository(CourseRepository)
    public courseRepository : CourseRepository,
    @inject(RestBindings.Http.RESPONSE) private res: Response
  ) {}

  /*
  ** Creates a Course.
  ** If the name is null or status is invalid, return HTTP 400 Bad Request
  ** If successful, returns  HTTP 200 OK and sets header 'Location' to Course pointer
  */
  @post('/courses')
  @response(200, {
    description: 'Course model instance',
    content: {'application/json': {schema: getModelSchemaRef(Course)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Course, {
            title: 'NewCourse',
            exclude: ['id'],
          }),
        },
      },
    })
    course: Course,
  ): Promise<Course> {
    console.log(`Attempting to create new Course`);
    
    if(course.name === null || course.name === ''){
      throw new HttpErrors.BadRequest('Creation failed. Course name is required.');
    }

    if(!this.validateStatus(course.status)){
      throw new HttpErrors.BadRequest(`Creation failed. ${course.status} is not a valid status`);
    }

    console.log(`Course input is valid. Creating new course ${course.name} (${course.status})`);

    return this.courseRepository.create(course)
    .then((newCourse) => {
      console.log(`Course ${newCourse.name} (${newCourse.id}) successfully created. Status: ${newCourse.status}`);

      this.res.setHeader('Location', `/courses/${newCourse.id}`);
      return newCourse;
    });
  }

  /* 
  ** Gets an array of non-deleted Courses,
  ** sorted in ASCending order (i.e. oldest first)
  ** Returns HTTP 200 OK
  */
  @get('/courses')
  @response(200, {
    description: 'Array of Course model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Course, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Course) filter?: Filter<Course>,
  ): Promise<Course[]> {
    filter = {
      ...filter,
      ...filter?.where,
      where: {deletedAt: {eq: null}},
      order: ['createdAt ASC'],
      fields: {
        id: true,
        name: true
      }
    };

    console.log(`Getting list of non-deleted Courses, sorted oldest to newest`);
    
    return this.courseRepository.find(filter);
  }

  /*
  ** Get Course by ID.
  ** If Course is found but has been deleted, return HTTP 410 Gone
  ** If Course does not exist, return HTTP 404 Not Found
  */
  @get('/courses/{id}')
  @response(200, {
    description: 'Course model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Course, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Course, {exclude: 'where'}) filter?: FilterExcludingWhere<Course>
  ): Promise<Course> {

    console.log(`Attempting to find Course with ID ${id}`);

    return this.courseRepository.findById(id, filter)
    .then((course) => {
      console.log(`Checking if Course (${id}) has been deleted`);
      if(this.isDeleted(course)){
        throw new HttpErrors.Gone(`Course with ID (${course.id}) was already deleted`);
      }

      console.log(`Course ${course.name} (${course.id}) successfully found`);

      return course;
    });
  }

  /*
  ** Updates Course by ID
  ** If input is invalid, throw HTTP 400 Bad Request
  ** If Course does not exist, throw HTTP 404 Not Found
  ** If successful, returns HTTP 204 No Content
  */
  @put('/courses/{id}')
  @response(204, {
    description: 'Course PUT successful',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() course: Course,
  ): Promise<void> {
    course = new Course({
      ...course,
      updatedAt: new Date().toISOString()
    });
    console.log(`Attempting to edit/replace Course with ID ${id}`);
    
    if(course.name === null || course.name === ''){
      throw new HttpErrors.BadRequest(`Update of Course (${id}) failed. Course name is required.`);
    }

    if(!this.validateStatus(course.status)){
      throw new HttpErrors.BadRequest(`Update of Course (${id}) failed. ${course.status} is not a valid status`);
    }

    console.log(`Course input is valid. Updating Course ${course.name} (${course.id}) with status: ${course.status})`);

    await this.courseRepository.replaceById(id, course);
  }

  /*
  ** Deletes the course with ID {id} by setting its deletedAt property.
  ** If there is no course with ID {id}, throw HHTP 404 Not Found.
  ** If the course has a non-empty deletedAt value, throw HTTP 410 Gone.
  ** If successfully deleted, return HTTP 204 No Content.
  */
  @del('/courses/{id}')
  @response(204, {
    description: 'Course DELETE successful',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    let course: Course = await this.findById(id);
    if (course == null) {
      throw new HttpErrors.NotFound(`Delete failed. No course found with ID ${id}`);
    }

    if(this.isDeleted(course)){
        throw new HttpErrors.Gone(`Delete failed. Course ${course.name} (ID: ${course.id}) was deleted on ${course.deletedAt}`);
    }

    course = new Course({
      ...course,
      deletedAt: new Date().toISOString()
    });

    await this.replaceById(id, course);
  }

  private validateStatus(status: String) : boolean {
    switch (status) {
      case 'scheduled':
      case 'in_production':
      case 'available':
        return true;
      default:
        return false;
    }
  }

  private isDeleted(course: Course): boolean {
    return !(course.deletedAt === null);
  }
}
