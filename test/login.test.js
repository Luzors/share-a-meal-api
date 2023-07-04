process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareamealtest';

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
chai.should()
chai.use(chaiHttp)


// UC-101 Inloggen
describe('UC-101 Sign in', () => {

    // TC-101-1 - Required field missing
      it('TC-101-1 - Required field missing', (done) => {
        chai
          .request(server)
          .post('/api/login')
          .send({
            emailAdress: 'j.doe@server.com'
            //password missing
          })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(400);
            res.body.should.have.property('message');
            done();
          });
      });
  
    // TC-101-2 - Wrong password
    it('TC-101-2 - Wrong password', (done) => {
        chai
          .request(server)
          .post('/api/login')
          .send({
            emailAdress: 'j.doe@server.com',
            password: "VerkeerdWachtwoord"
          })
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(400);
            res.body.should.have.property('message');
            done();
          });
      });
  
    // TC-101-3 - User doesnt exist
    it('TC-101-3 - User doesnt exist', (done) => {
        chai
          .request(server)
          .post('/api/login')
          .send({
            emailAdress: 'nope@server.com',
            password: 'secret'
          })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(404);
            res.body.should.have.property('message');
            done();
          });
      }); 

    // TC-101-4 - Signed in succesfully
    it('TC-101-3 - Signed in succesfully', (done) => {
        chai
          .request(server)
          .post('/api/login')
          .send({
            emailAdress: 'j.doe@server.com',
            password: 'secret'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('status').to.be.equal(200);
            res.body.should.have.property('message');
            done();
          });
      }); 
  });
